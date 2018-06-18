#include "ofApp.h"
#include "ofxOscSubscriber.h"

bool showfps = false;
float fps;

//--------------------------------------------------------------
void ofApp::setup(){
	ofxSubscribeOsc(3333, "/foot/pressure", footPressure);

	grabber.initGrabber(1280, 720);

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
	fbo.allocate(800, 800, GL_RGBA32F);

	footCount = 0;
	isFootReleased = true;
}

//--------------------------------------------------------------
void ofApp::update(){
	grabber.update();

	if (ofGetFrameNum() % 60 == 0) {
		//shadertoy.load("shaders/raymarch.frag");
 	}

	if (footCount == 0 && footPressure > 0.8 && isFootReleased) {
		isFootReleased = false;
		footCount = 60;
	}
	else {
		if (footCount > 0) footCount--;
	}

	if (footPressure < 0.2) {
		isFootReleased = true;
	}
}

//--------------------------------------------------------------
void ofApp::draw(){
	fbo.begin();
	grabber.draw(0, 0);
	fbo.end();

	shadertoy.shader.begin();
	shadertoy.shader.setUniform1f("iTime", shadertoy.globalTime);
	shadertoy.shader.setUniform1f("footCount", footCount / 60.0f);
	shadertoy.shader.setUniform3f("iResolution", shadertoy.dimensions.x, shadertoy.dimensions.y, 4.0f);
	if (shadertoy.camera) {
		ofMatrix4x4 cmtx(shadertoy.camera->getOrientationQuat());
		cmtx.setTranslation(-shadertoy.camera->getPosition());
		shadertoy.shader.setUniformMatrix4f("tCameraMatrix", cmtx);
	}
	else {
		shadertoy.shader.setUniformMatrix4f("tCameraMatrix", ofMatrix4x4::newIdentityMatrix());
	}
	shadertoy.shader.setUniformTexture("iChannel0", grabber.getTexture(), 0);
	shadertoy.shader.setUniformTexture("iChannel1", fbo.getTexture(), 1);

	ofDrawPlane(400, 400, 0, 800, 800);
	shadertoy.shader.end();
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
