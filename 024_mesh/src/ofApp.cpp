#include "ofApp.h"

bool showfps = false;
float fps;

//--------------------------------------------------------------
void ofApp::setup(){
    shadertoy.load("shaders/raymarch.frag");
    ofSetFrameRate(60);
    //camera.movespeed = 0.05;
    //camera.rollspeed = camera.sensitivity = 0.2;
    //camera.enableControls();
    shadertoy.setAdvanceTime(true);
    shadertoy.setCamera(&camera);
	camera.setPosition(glm::vec3(0, -0.5, 800));

	ofEnableArbTex();
	m = ofMesh::sphere(200);
	fbo.allocate(800, 800, GL_RGBA);
}

//--------------------------------------------------------------
void ofApp::update(){
}

//--------------------------------------------------------------
void ofApp::draw(){
	for (int i = 0; i < m.getNumVertices(); i++) {
		auto v = m.getVertex(i);
		v = glm::normalize(v) * ofMap(ofNoise(i * 0.1f, ofGetElapsedTimef() * 0.5f), 0, 1, 100, 200);
		m.setVertex(i, v);
	}
	camera.rotateAroundRad(0.1f, glm::vec3(0, 1, 0), glm::vec3(0, 0, 100));
	camera.lookAt(glm::vec3(0, 0, 0));
	fbo.begin();
	ofClear(0);
	ofSetColor(0);
	camera.begin();
	m.drawWireframe();
	camera.end();
	fbo.end();
	tex = fbo.getTexture();
	tex.setTextureWrap(GL_REPEAT, GL_REPEAT);
	tex.generateMipmap();

	shadertoy.setTexture(0, tex);
	shadertoy.setTexture(1, tex);
	shadertoy.setTexture(2, fbo.getTexture());
	shadertoy.setTexture(3, fbo.getTexture());

	shadertoy.draw(0, 0, ofGetWindowWidth(), ofGetWindowHeight());
    if(showfps)ofDrawBitmapString(ofToString(ofGetFrameRate()), ofPoint(10, 10));
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
