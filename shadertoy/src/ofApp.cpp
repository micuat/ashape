#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){
	grabber.initGrabber(1280, 720);

	currentShaderFile = "raymarch.frag";
	shadertoy.load(currentShaderFile);
    ofSetFrameRate(30);

    shadertoy.setAdvanceTime(true);
    shadertoy.setCamera(&camera);
	camera.setPosition(glm::vec3(0, -0.5, 800));

	ofDisableArbTex();
	fbo.allocate(ofGetWidth(), ofGetHeight(), GL_RGBA32F);
}

//--------------------------------------------------------------
void ofApp::update(){
	grabber.update();

	if (ofGetFrameNum() % 60 == 0) {
		//shadertoy.load("shaders/raymarch.frag");
 	}
}

//--------------------------------------------------------------
void ofApp::draw(){
	fbo.begin();
	grabber.draw(0, 0);
	fbo.end();

	shadertoy.begin();
	shadertoy.shader.setUniformTexture("iChannel0", fbo.getTexture(), 0);
	shadertoy.shader.setUniform1f("iGlobalTime", ofGetFrameNum() / 30.0f);
	shadertoy.shader.setUniform1f("iTime", ofGetFrameNum() / 30.0f);

	ofDrawPlane(ofGetWidth() * 0.5f, ofGetHeight() * 0.5f, 0, ofGetWidth(), ofGetHeight());
	shadertoy.end();

	if(currentShaderFile != "raymarch.frag")
	ofSaveScreen("captures/" + ofToString(ofGetFrameNum()- frameNumStart, 6, '0') + ".png");
}


//--------------------------------------------------------------
void ofApp::keyPressed(int key){
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){
    if (key == 'r') {
		shadertoy.load(currentShaderFile);
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
		currentShaderFile = dragInfo.files.at(0);
		shadertoy.load(currentShaderFile);
		frameNumStart = ofGetFrameNum();
	}
}
