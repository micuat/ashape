#include "ofApp.h"

string code = "";
bool isReloaded = true;

//--------------------------------------------------------------
void ofApp::setup(){
	ofSetFrameRate(30);

	ofxDukBindings::setup(duk);
	duk.pushFunction([](ofxDuktape& duk)->duk_ret_t {
		ofLogNotice("ofxDuktape - inside VM") << "hello!";
		duk.pushBool(true);
		return 1;
	}, 0);

	duk.putGlobalString("hello");
	duk.pCompileString("hello();", DUK_COMPILE_EVAL);
	duk.call(0);
	ofLogNotice("ofxDuktape - outside VM") << "return value is " << duk.safeToString(-1);

	duk.pushFunction([&](ofxDuktape& duk)->duk_ret_t {
		duk.pushNumber(isReloaded);
		isReloaded = false;
		return 1;
	}, 0);
	duk.putGlobalString("isReloaded");
}

//--------------------------------------------------------------
void ofApp::update(){
	if (ofGetFrameNum() % 60 == 0) {
		string lastCode = code;
		ofFile file;

		file.open(ofToDataPath("sketch.js"), ofFile::ReadOnly, false);
		ofBuffer buff = file.readToBuffer();
		code = buff.getText();

		if(lastCode != code)
			isReloaded = true;
	}
}

//--------------------------------------------------------------
void ofApp::draw(){
	if (ofGetFrameNum() == 60) {
		ofxDukBindings::setup(duk);
	}
	duk.pEvalString(code);
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){

}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){

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
void ofApp::mouseEntered(int x, int y){

}

//--------------------------------------------------------------
void ofApp::mouseExited(int x, int y){

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
