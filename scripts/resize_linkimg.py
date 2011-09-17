import Image
import os
import sys

files = os.listdir("../linkimg-orig")

height = int(sys.argv[1])
width = int(sys.argv[1])

for f in files:
    if f[-4:]==".png":
        im = Image.open("../linkimg-orig/" + f)
        im = im.resize((width,height), Image.ANTIALIAS)
	im.save("../linkimg/" + f)

