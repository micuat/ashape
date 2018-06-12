#include "ofApp.h"

bool showfps = false;
float fps;

//--------------------------------------------------------------
void ofApp::setup(){
    shadertoy.load("shaders/raymarch.frag");
	depthShader.load("shaders/d");
    ofSetFrameRate(60);
    //camera.movespeed = 0.05;
    //camera.rollspeed = camera.sensitivity = 0.2;
    //camera.enableControls();
    shadertoy.setAdvanceTime(true);
    shadertoy.setCamera(&camera);
	camera.setPosition(glm::vec3(0, -0.5, 800));

	ofDisableArbTex();
	m = ofMesh::sphere(200);
	fbo.allocate(800, 800, GL_RGBA32F);
}

//--------------------------------------------------------------
void ofApp::update(){
}

//--------------------------------------------------------------
void ofApp::draw(){
	for (int i = 0; i < m.getNumVertices(); i++) {
		auto v = m.getVertex(i);
		v = glm::normalize(v) * ofMap(ofNoise(i * 0.1f, ofGetElapsedTimef() * 0.5f), 0, 1, 200, 300);
		m.setVertex(i, v);
	}
	//camera.rotateAroundRad(0.01f, glm::vec3(0, 1, 0), glm::vec3(0, 0, 100));
	//camera.lookAt(glm::vec3(0, 0, 0));
	fbo.begin();
	ofEnableDepthTest();
	depthShader.begin();
	ofBackground(0);
	ofSetColor(255);
	camera.begin();
	m.draw();
	camera.end();
	depthShader.end();
	fbo.end();
	tex = fbo.getTexture();
	tex.setTextureWrap(GL_REPEAT, GL_REPEAT);
	tex.generateMipmap();

	shadertoy.setTexture(1, tex);

	//shadertoy.draw(0, 0, ofGetWindowWidth(), ofGetWindowHeight());
    //if(showfps)ofDrawBitmapString(ofToString(ofGetFrameRate()), ofPoint(10, 10));
	//fbo.draw(0, 0);
	//tex.draw(0, 0);

	shadertoy.shader.begin();
	shadertoy.shader.setUniform1f("iTime", shadertoy.globalTime);
	shadertoy.shader.setUniform3f("iResolution", shadertoy.dimensions.x, shadertoy.dimensions.y, 4.0f);
	if (shadertoy.camera) {
		ofMatrix4x4 cmtx(shadertoy.camera->getOrientationQuat());
		cmtx.setTranslation(-shadertoy.camera->getPosition());
		shadertoy.shader.setUniformMatrix4f("tCameraMatrix", cmtx);
	}
	else {
		shadertoy.shader.setUniformMatrix4f("tCameraMatrix", ofMatrix4x4::newIdentityMatrix());
	}
	shadertoy.shader.setUniformTexture("iChannel1", fbo.getTexture(), 2);
	//fbo.getTexture().bind();
	ofDrawPlane(400, 400, 0, 800, 800);
	//fbo.getTexture().unbind();
	//fbo.draw(0, 0);
	shadertoy.shader.end();

	fbo.draw(0, 0);
}


//--------------------------------------------------------------
void ofApp::keyPressed(int key){
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){
    if (key == 'r') {
        shadertoy.load("shaders/raymarch.frag");
    }
    if (key == ' ') {
        showfps = !showfps;
    }if(key == 'f') {
		ofToggleFullscreen();
	}
}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){
}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){
}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){
}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 

}
