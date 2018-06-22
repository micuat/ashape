#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){
	grabber.initGrabber(1280, 720);

	currentShaderFolder = ".";
	shadertoy.load(currentShaderFolder +"/frag.glsl");
    ofSetFrameRate(30);

    shadertoy.setAdvanceTime(true);
    shadertoy.setCamera(&camera);
	camera.setPosition(glm::vec3(0, -0.5, 800));

	ofDisableArbTex();
	fbo.allocate(ofGetWidth(), ofGetHeight(), GL_RGBA32F);
	dukFbo.allocate(ofGetWidth(), ofGetHeight(), GL_RGBA32F);
}

//--------------------------------------------------------------
void ofApp::update(){
	grabber.update();

	if (ofGetFrameNum() % 60 == 0) {
		//shadertoy.load("shaders/raymarch.frag");
 	}

	if (ofGetFrameNum() % 60 == 0) {
		auto func = [&](string name) {
			ofFile file;

			file.open(ofToDataPath(name), ofFile::ReadOnly, false);
			ofBuffer buff = file.readToBuffer();
			return buff.getText();
		};
		code = func(currentShaderFolder + "/script.js");
	}
}

//--------------------------------------------------------------
void ofApp::draw(){
	if (ofGetFrameNum() == 60) {
		ofxDukBindings::setup(duk);
	}

	dukFbo.begin();
	duk.pEvalString(code);
	dukFbo.end();

	fbo.begin();
	grabber.draw(0, 0);
	fbo.end();

	shadertoy.begin();
	shadertoy.shader.setUniformTexture("iChannel0", fbo.getTexture(), 0);
	shadertoy.shader.setUniformTexture("iChannel1", dukFbo.getTexture(), 1);
	shadertoy.shader.setUniform1f("iGlobalTime", ofGetFrameNum() / 30.0f);
	shadertoy.shader.setUniform1f("iTime", ofGetFrameNum() / 30.0f);

	ofDrawPlane(ofGetWidth() * 0.5f, ofGetHeight() * 0.5f, 0, ofGetWidth(), ofGetHeight());
	shadertoy.end();

	//if(currentShaderFile != "raymarch.frag")
	//ofSaveScreen("captures/" + ofToString(ofGetFrameNum()- frameNumStart, 6, '0') + ".png");
}


//--------------------------------------------------------------
void ofApp::keyPressed(int key){
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){
    if (key == 'r') {
		shadertoy.load(currentShaderFolder + "/frag.glsl");
	}
    if(key == 'f') {
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
	if (dragInfo.files.size() > 0) {
		currentShaderFolder = dragInfo.files.at(0);
		shadertoy.load(currentShaderFolder + "/frag.glsl");
		frameNumStart = ofGetFrameNum();
	}
}
