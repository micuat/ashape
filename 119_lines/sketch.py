d1 >> play("x{[--]-}o{[--][----]}", sus=[1, 2], lpf=[100, 10000, 10000])

p1 >> pluck([0,2,4], dur=[[1,1/2], [1/2, 1],1/2], amp=[1,3/4,3/4])
#d1 >> play("*", dur=4)
p2 >> pads([0,1,2,3]) + [0,1,[0,(0,2)]]

p2.solo(0)

b1 >> bass([0,4,5,3], dur=2)
p1 >> pads().follow(b1) + [2,4,7]

p1 >> pads(P[1:9]).every(8, "shuffle")

print(P*(1,2))
p1 >> pluck(P*(0,2,4), dur=1/2)
p1 >> pluck(P(4,6,8)-)

print(Samples)

bd >> play("1  2  x  ", room=[1])
d1 >> play(P["x-o-"] & P[" **"], room=[0, 0, 1])

p1 >> pads([0,1,2,3,4], dur=[1,1,1,1,rest(4)])

a = var([0,4,5,3], 3)
b1 >> bass(a, dur=PBeat("x xxx "))
b1 >> bass(a, dur=PDur(5,9))
print(PBeat("x x xxx "))
p1 >> pads(a + (0,2), dur=PDur(7,16))

