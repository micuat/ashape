#include "ofApp.h"

//--------------------------------------------------------------
void ofApp::setup(){
	grabber.initGrabber(1280, 720);

	shadertoy.load("raymarch.frag");
    ofSetFrameRate(60);

    shadertoy.setAdvanceTime(true);
    shadertoy.setCamera(&camera);
	camera.setPosition(glm::vec3(0, -0.5, 800));

	ofDisableArbTex();
	fbo.allocate(800, 800, GL_RGBA32F);
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

	ofDrawPlane(400, 400, 0, 800, 800);
	shadertoy.end();
}


//--------------------------------------------------------------
void ofApp::keyPressed(int key){
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){
    if (key == 'r') {
		shadertoy.load("shaders/raymarch.frag");
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

}
