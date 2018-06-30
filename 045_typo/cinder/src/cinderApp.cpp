#include "cinder/app/App.h"
#include "cinder/app/RendererGl.h"
#include "cinder/gl/gl.h"
#include "cinder/CameraUi.h"
#include "cinder/Log.h"
#include "cinder/TriMesh.h"
#include "cinder/ImageIo.h"
#include "cinder/Utilities.h"
#include "cinder/Perlin.h"

#include "CinderImGui.h"

using namespace ci;
using namespace ci::app;
using namespace std;

class cinderApp : public App {
  public:
	void setup() override;
	void keyDown(KeyEvent event) override;
	void mouseDown( MouseEvent event ) override;
	void update() override;
	void draw() override;
	void resize() override;

	CameraPersp				mCamera;
	CameraUi				mCameraUi;
	gl::BatchRef			mModelBatch, mSkyBoxBatch;
	gl::TextureCubeMapRef	mIrradianceMap, mRadianceMap;
	gl::Texture2dRef		mNormalMap, mRoughnessMap, mMetallicMap;
	TriMeshRef mesh;

	int						mGridSize;
	bool					mShowUi, mRotateModel;
	float					mRoughness, mMetallic, mSpecular;
	Color					mBaseColor;
	float					mGamma, mExposure, mTime;

	gl::GlslProgRef pbrShader;

	Font mFont;
	gl::TextureFontRef mTextureFont;
	gl::FboRef mFbo;
	vector<string> words = { "factor",
		"element",
		"formula",
		"equation",
		"proposition",
		"theory" };
	Perlin mPerlin;
};

void cinderApp::setup()
{
	// add the common texture folder
	addAssetDirectory(fs::path(__FILE__).parent_path().parent_path().parent_path().parent_path() / "assets");

	// create a Camera and a Camera ui
	mCamera = CameraPersp(getWindowWidth(), getWindowHeight(), 50.0f, 0.1f, 200.0f).calcFraming(Sphere(vec3(0.0f), 2.0f));
	mCameraUi = CameraUi(&mCamera, getWindow(), -1);

	// prepare ou rendering objects and shaders
	pbrShader = gl::GlslProg::create(gl::GlslProg::Format().vertex(loadAsset("PBR045.vert")).fragment(loadAsset("PBR045.frag")));
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
		writeImage(getHomeDirectory() / "cinder" / "saveImage_" / ("capture.png"), copyWindowSurface());
		if (event.getCode() == KeyEvent::KEY_SPACE) mShowUi = !mShowUi;
	});

	mFont = Font("Arial", 30);
	mTextureFont = gl::TextureFont::create(mFont);

	gl::Fbo::Format fmt;
	fmt.setSamples(16);

	// setup our scene Fbo
	mFbo = gl::Fbo::create(1024, 1024, fmt);
}

void cinderApp::resize()
{
	mCamera.setAspectRatio(getWindowAspectRatio());
}

void cinderApp::keyDown( KeyEvent event )
{
	try {
		pbrShader = gl::GlslProg::create(gl::GlslProg::Format().vertex(loadAsset("PBR045.vert")).fragment(loadAsset("PBR045.frag")));
	}
	catch (...) {

	}
}

void cinderApp::mouseDown(MouseEvent event)
{
}

void cinderApp::update()
{
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
	gl::clear(Color(0, 0, 0));

	{
		//gl::ScopedFramebuffer(mFbo, GL_FRAMEBUFFER);
		mFbo->bindFramebuffer();
		gl::setMatricesWindow(getWindowSize());
		gl::clear(Color(0, 0, 0));
		for (int i = 10; i < 40; i++) {
			for (int j = 0; j < 3; j++) {
				int index = floorf(words.size() * (0.5f * mPerlin.fBm(vec3(i * 0.8f, j * 0.3f, getElapsedSeconds() * 0.8f)) + 0.5f));
				mTextureFont->drawString(words.at(index), vec2(100 * j, 20 * i));
			}
		}
		mFbo->unbindFramebuffer();
	}

	mesh = TriMesh::create(
		TriMesh::Format()
		.positions()
		.texCoords(2)
		.normals()
	);

	int ni = 32;
	int nj = 32;
	for (int i = 0; i <= ni; i++)
	{
		float rho = (float)i / ni * M_PI;
		for (int j = 0; j <= nj; j++)
		{
			float phi = (float)j / nj * 2 * M_PI;
			float r2 = 1.0f;// *lmap(sinf(phi * 4.0f + getElapsedSeconds()), -1.0f, 1.0f, 0.85f, 1.0f);
			float r1 = 1.0f;
			float r = 2.0f;
			float x = r * r1 * r2 * cosf(phi) * sinf(rho);
			float y = r * r2 * cosf(rho);
			float z = r * r1 * r2 * sinf(phi) * sinf(rho);
			mesh->appendPosition(vec3(x, y, z));
			mesh->appendTexCoord(vec2((float)j / nj, (float)i / ni));
			mesh->appendNormal(glm::normalize(vec3(cosf(phi) * sinf(rho), cosf(rho), sinf(phi) * sinf(rho))));

			if (i > 0 && j > 0) {
				mesh->appendTriangle(i * nj + j,
					(i-1) * nj + j-1,
					i * nj + j-1);

				mesh->appendTriangle(i * nj + j,
					(i - 1) * nj + j,
					(i - 1) * nj + j - 1);
			}
		}
	}
	for (int i = 0; i <= ni; i++)
	{
		for (int j = 0; j <= nj; j++)
		{
			auto& p = mesh->getPositions<3>()[i * nj + j];
			auto& pw = mesh->getPositions<3>()[i * nj + (j + nj - 1) % nj];
			auto& pn = mesh->getPositions<3>()[max(i - 1, 0) * nj + j];
			mesh->appendNormal(glm::normalize(glm::vec3(p.x - pw.x, p.y - pn.y, 0.5f)));
		}
	}
	mesh->recalculateNormals();
	mModelBatch = gl::Batch::create(*mesh, pbrShader);

	// clear window and set matrices
	gl::setMatrices(mCamera);

	// enable depth testing
	gl::ScopedDepth scopedDepth(true);

	// bind the textures
	gl::ScopedTextureBind scopedTexBind0(mRadianceMap, 0);
	gl::ScopedTextureBind scopedTexBind1(mIrradianceMap, 1);
	gl::ScopedTextureBind scopedTexBind2(mNormalMap, 2);
	gl::ScopedTextureBind scopedTexBind3(mRoughnessMap, 3);
	gl::ScopedTextureBind scopedTexBind4(mMetallicMap, 4);
	gl::ScopedTextureBind scopedTexBind5(mFbo->getColorTexture(), 5);

	auto shader = mModelBatch->getGlslProg();
	shader->uniform("uRadianceMap", 0);
	shader->uniform("uIrradianceMap", 1);
	shader->uniform("uNormalMap", 2);
	shader->uniform("uRoughnessMap", 3);
	shader->uniform("uMetallicMap", 4);
	shader->uniform("uFbo", 5);
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
	shader->uniform("uTime", (float)getElapsedSeconds());

	// render our test model
	{
		gl::ScopedMatrices scopedMatrices;
		gl::setModelMatrix(glm::rotate(mTime, vec3(0.123, 0.456, 0.789)));
		mModelBatch->draw();
	}
}

CINDER_APP( cinderApp, RendererGl(RendererGl::Options().msaa(16)) )
