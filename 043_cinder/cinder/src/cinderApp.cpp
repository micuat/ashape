#include "cinder/app/App.h"
#include "cinder/app/RendererGl.h"
#include "cinder/gl/gl.h"
#include "cinder/CameraUi.h"
#include "cinder/Log.h"
#include "cinder/TriMesh.h"

#include "CinderImGui.h"
using namespace ci;
using namespace ci::app;
using namespace std;

class cinderApp : public App {
  public:
	void setup() override;
	void mouseDown( MouseEvent event ) override;
	void update() override;
	void draw() override;
	void resize() override;

	CameraPersp				mCamera;
	CameraUi				mCameraUi;
	gl::BatchRef			mModelBatch, mSkyBoxBatch;
	gl::TextureCubeMapRef	mIrradianceMap, mRadianceMap;
	gl::Texture2dRef		mNormalMap, mRoughnessMap, mMetallicMap;
	gl::VboMeshRef	mVboMesh;
	TriMeshRef mesh;

	int						mGridSize;
	bool					mShowUi, mRotateModel;
	float					mRoughness, mMetallic, mSpecular;
	Color					mBaseColor;
	float					mGamma, mExposure, mTime;

	gl::GlslProgRef pbrShader;
};

void cinderApp::setup()
{
	// add the common texture folder
	//addAssetDirectory(fs::path(__FILE__).parent_path().parent_path().parent_path() / "common/textures");

	// create a Camera and a Camera ui
	mCamera = CameraPersp(getWindowWidth(), getWindowHeight(), 50.0f, 0.1f, 200.0f).calcFraming(Sphere(vec3(0.0f), 2.0f));
	mCameraUi = CameraUi(&mCamera, getWindow(), -1);

	// prepare ou rendering objects and shaders
	pbrShader = gl::GlslProg::create(gl::GlslProg::Format().vertex(loadAsset("PBR.vert")).fragment(loadAsset("PBR.frag")));
	auto skyBoxShader = gl::GlslProg::create(gl::GlslProg::Format().vertex(loadAsset("SkyBox.vert")).fragment(loadAsset("SkyBox.frag")));
	mModelBatch = gl::Batch::create(geom::Teapot().subdivisions(16) >> geom::Transform(glm::scale(vec3(1.5f))), pbrShader);
	mSkyBoxBatch = gl::Batch::create(geom::Cube().size(vec3(100)), skyBoxShader);

	// load the prefiltered IBL Cubemaps
	auto cubeMapFormat = gl::TextureCubeMap::Format().mipmap().internalFormat(GL_RGB16F).minFilter(GL_LINEAR_MIPMAP_LINEAR).magFilter(GL_LINEAR);
	mIrradianceMap = gl::TextureCubeMap::createFromDds(loadAsset("CathedralIrradiance.dds"), cubeMapFormat);
	mRadianceMap = gl::TextureCubeMap::createFromDds(loadAsset("CathedralRadiance.dds"), cubeMapFormat);

	// load the material textures
	auto textureFormat = gl::Texture2d::Format().mipmap().minFilter(GL_LINEAR_MIPMAP_LINEAR).magFilter(GL_LINEAR);
	mNormalMap = gl::Texture2d::create(loadImage(loadAsset("normal.png")));
	mRoughnessMap = gl::Texture2d::create(loadImage(loadAsset("roughness.png")), textureFormat);
	mMetallicMap = gl::Texture2d::create(loadImage(loadAsset("metallic.png")), textureFormat);

	// set the initial parameters and setup the ui
	mGridSize = 5;
	mRoughness = 1.0f;
	mMetallic = 1.0f;
	mSpecular = 1.0f;
	mBaseColor = Color::white();
	mGamma = 2.2f;
	mExposure = 4.0f;
	mTime = 0.0f;
	mShowUi = false;
	mRotateModel = false;

	// prepare ui
	ui::initialize();
	getWindow()->getSignalKeyDown().connect([this](KeyEvent event) {
		if (event.getCode() == KeyEvent::KEY_SPACE) mShowUi = !mShowUi;
	});

	// create some geometry using a geom::Plane
	auto plane = geom::Plane().size(vec2(20, 20)).subdivisions(ivec2(200, 50));

	// Specify two planar buffers - positions are dynamic because they will be modified
	// in the update() loop. Tex Coords are static since we don't need to update them.
	vector<gl::VboMesh::Layout> bufferLayout = {
		gl::VboMesh::Layout().usage(GL_DYNAMIC_DRAW).attrib(geom::Attrib::POSITION, 3),
		gl::VboMesh::Layout().usage(GL_STATIC_DRAW).attrib(geom::Attrib::TEX_COORD_0, 2)
	};

	mVboMesh = gl::VboMesh::create(plane, bufferLayout);
}

void cinderApp::resize()
{
	mCamera.setAspectRatio(getWindowAspectRatio());
}

void cinderApp::mouseDown( MouseEvent event )
{
}

void cinderApp::update()
{
	float offset = getElapsedSeconds() * 4.0f;

	// Dynmaically generate our new positions based on a sin(x) + cos(z) wave
	// We set 'orphanExisting' to false so that we can also read from the position buffer, though keep
	// in mind that this isn't the most efficient way to do cpu-side updates. Consider using VboMesh::bufferAttrib() as well.
	auto mappedPosAttrib = mVboMesh->mapAttrib3f(geom::Attrib::POSITION, false);
	for (int i = 0; i < mVboMesh->getNumVertices(); i++) {
		vec3 &pos = *mappedPosAttrib;
		mappedPosAttrib->y = sin(offset - glm::length(vec2(pos.x, pos.z)) * 3.0) * 0.25 + 0.25;
		++mappedPosAttrib;
	}
	mappedPosAttrib.unmap();

	// user interface
	if (mShowUi) {
		ui::ScopedWindow window("PBRBasics");
		if (ui::CollapsingHeader("Material", nullptr, true, true)) {
			ui::DragFloat("Roughness", &mRoughness, 0.01f, 0.0f, 1.0f);
			ui::DragFloat("Metallic", &mMetallic, 0.01f, 0.0f, 1.0f);
			ui::DragFloat("Specular", &mSpecular, 0.01f, 0.0f, 1.0f);
			ui::ColorEdit3("Color", &mBaseColor[0]);
		}
		if (ui::CollapsingHeader("Model", nullptr, true, true)) {
			static int currentPrimitive = 1;
			const static vector<string> primitives = { "Sphere", "Teapot", "Cube", "Capsule", "Torus", "TorusKnot" };
			ui::Checkbox("Rotate", &mRotateModel);
		}
		if (ui::CollapsingHeader("Environment", nullptr, true, true)) {
			static int currentEnvironment = 2;
			const static vector<string> environments = { "Bolonga", "Wells", "Cathedral" };
		}
		if (ui::CollapsingHeader("Rendering", nullptr, true, true)) {
			ui::DragFloat("Gamma", &mGamma, 0.01f, 0.0f);
			ui::DragFloat("Exposure", &mExposure, 0.01f, 0.0f);
		}
	}

	if (mRotateModel) {
		mTime += 0.025f;
	}
}

void cinderApp::draw()
{
	mesh = TriMesh::create(
		TriMesh::Format()
		.positions()
		.texCoords(2)
	);
	/*
	// Create the points of our cube
	vec3 v0{ -1, -1, -1 };
	vec3 v1{ 1, -1, -1 };
	vec3 v2{ 1,  1, -1 };
	vec3 v3{ -1,  1, -1 };
	vec3 v4{ -1, -1,  1 };
	vec3 v5{ 1, -1,  1 };
	vec3 v6{ 1,  1,  1 };
	vec3 v7{ -1,  1,  1 };

	// Create the colors for each vertex
	Color c0{ 0, 0, 0 };
	Color c1{ 1, 0, 0 };
	Color c2{ 1, 1, 0 };
	Color c3{ 0, 1, 0 };
	Color c4{ 0, 0, 1 };
	Color c5{ 1, 0, 1 };
	Color c6{ 1, 1, 1 };
	Color c7{ 0, 1, 1 };

	// Create the texture coordinates for each vertex
	vec2 t0{ 0, 0 };
	vec2 t1{ 1, 0 };
	vec2 t2{ 1, 1 };
	vec2 t3{ 0, 1 };

	vec3 faces[6][4] = {
		{ v0, v1, v2, v3 },{ v3, v2, v6, v7 },{ v7, v6, v5, v4 },
	{ v4, v5, v1, v0 },{ v5, v6, v2, v1 },{ v7, v4, v0, v3 }
	};

	for (int i = 0; i < 6; i++)
	{
		mesh->appendPosition(faces[i][0]);
		mesh->appendTexCoord(t0);
		mesh->appendPosition(faces[i][1]);
		mesh->appendTexCoord(t1);
		mesh->appendPosition(faces[i][2]);
		mesh->appendTexCoord(t2);
		mesh->appendPosition(faces[i][3]);
		mesh->appendTexCoord(t3);

		int numberVertices = mesh->getNumVertices();

		mesh->appendTriangle(numberVertices - 4,
			numberVertices - 3,
			numberVertices - 2);

		mesh->appendTriangle(numberVertices - 4,
			numberVertices - 2,
			numberVertices - 1);
	}*/
	int n = 16;
	for (int i = 0; i < n; i++)
	{
		for (int j = 0; j < n; j++)
		{
			mesh->appendPosition(vec3((float)j / n * 2 - 1, (float)i / n * 2 - 1, 0.1*sin(j * 0.5 + i * 0.2 + getElapsedSeconds())));
			mesh->appendTexCoord(vec2((float)j / n, (float)i / n));

			if (i > 0 && j > 0) {
				mesh->appendTriangle(i * n + j,
					(i-1) * n + j-1,
					i * n + j-1);

				mesh->appendTriangle(i * n + j,
					(i - 1) * n + j,
					(i - 1) * n + j - 1);
			}
		}
	}
	mesh->recalculateNormals();
	mModelBatch = gl::Batch::create(*mesh, pbrShader);

	// clear window and set matrices
	gl::clear(Color(1, 0, 0));
	gl::setMatrices(mCamera);

	// enable depth testing
	gl::ScopedDepth scopedDepth(true);

	// bind the textures
	gl::ScopedTextureBind scopedTexBind0(mRadianceMap, 0);
	gl::ScopedTextureBind scopedTexBind1(mIrradianceMap, 1);
	gl::ScopedTextureBind scopedTexBind2(mNormalMap, 2);
	gl::ScopedTextureBind scopedTexBind3(mRoughnessMap, 3);
	gl::ScopedTextureBind scopedTexBind4(mMetallicMap, 4);

	auto shader = mModelBatch->getGlslProg();
	shader->uniform("uRadianceMap", 0);
	shader->uniform("uIrradianceMap", 1);
	shader->uniform("uNormalMap", 2);
	shader->uniform("uRoughnessMap", 3);
	shader->uniform("uMetallicMap", 4);
	shader->uniform("uRadianceMapSize", (float)mRadianceMap->getWidth());
	shader->uniform("uIrradianceMapSize", (float)mIrradianceMap->getWidth());

	// sends the base color, the specular opacity, roughness and metallic to the shader
	shader->uniform("uBaseColor", mBaseColor);
	shader->uniform("uSpecular", mSpecular);
	shader->uniform("uRoughness", mRoughness);
	shader->uniform("uMetallic", mMetallic);

	// sends the tone-mapping uniforms
	shader->uniform("uExposure", mExposure);
	shader->uniform("uGamma", mGamma);

	// render our test model
	{
		gl::ScopedMatrices scopedMatrices;
		gl::setModelMatrix(glm::rotate(mTime, vec3(0.123, 0.456, 0.789)));
		mModelBatch->draw();
	}

	// render skybox
	shader = mSkyBoxBatch->getGlslProg();
	shader->uniform("uExposure", mExposure);
	shader->uniform("uGamma", mGamma);
	mSkyBoxBatch->draw();
}

CINDER_APP( cinderApp, RendererGl(RendererGl::Options().msaa(16)) )
