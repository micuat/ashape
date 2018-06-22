var f = Math.sin(of.elapsedTime * Math.PI * 0.5) * 500;
// of.background(128);
of.pushMatrix();
of.translate(of.windowWidth * 0.5, of.windowHeight * 0.5);
of.fill();
if(f >= 0)
  of.setColor(255, 20);
else
  of.setColor(0, 20);
of.drawCircle(0, 0, 550-Math.abs(f));
of.popMatrix();
