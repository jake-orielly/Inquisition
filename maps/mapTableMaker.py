mapName = raw_input("Enter map name:")

readFile = open("/users/jake/Desktop/inquisition/maps/" + mapName + ".html","r").read()
writeFile = open("/users/jake/Desktop/inquisition/maps/" + mapName + ".js","w")
result = []
curr = -1
finalResult = "var " + mapName + " = \n["

for i in range(len(readFile)):
    if readFile[i] == "#":
        if (readFile[i:i+7] == "#98ca68"):
            result[curr].append("\"grass\"")
        elif (readFile[i:i+7] == "#7f7f7f"):
            result[curr].append("\"cave_floor\"")
        elif (readFile[i:i+7] == "#408000"):
            result[curr].append("\"oak\"")
        elif (readFile[i:i+7] == "#804000"):
            result[curr].append("\"village\"")
        elif (readFile[i:i+7] == "#14470e"):
            result[curr].append("\"evergreen\"")
        elif (readFile[i:i+7] == "#666666"):
            result[curr].append("\"mountain\"")
        elif (readFile[i:i+7] == "#ffcc66"):
            result[curr].append("\"beach\"")
        elif (readFile[i:i+7] == "#0080ff"):
            result[curr].append("\"ocean\"") #will be ocean
        elif (readFile[i:i+7] == "#ff8000"):
            result[curr].append("\"copper_vein\"")
        elif (readFile[i:i+7] == "#b3b3b3"):
            result[curr].append("\"iron_vein\"")
        elif (readFile[i:i+7] == "#333333"):
            result[curr].append("\"coal_vein\"")
        elif (readFile[i:i+7] == "#787878"):
            result[curr].append("\"stonePath\"")
        elif (readFile[i:i+7] == "#008040"):
            result[curr].append("\"herb_plant\"")
        elif (readFile[i:i+7] == "#ff0080"):
            result[curr].append("\"mushroom_plant\"")
        elif (readFile[i:i+7] == "#000000"):
            result[curr].append("\"cave_entrance\"")
        elif (readFile[i:i+7] == "#191919"):
            result[curr].append("\"cave_wall\"")
        elif (readFile[i:i+7] == "#9d6606"):
            result[curr].append("\"wood_wall\"")
        elif (readFile[i:i+7] == "#72531e"):
            result[curr].append("\"wood_floor\"")
        elif (readFile[i:i+7] == "#d38808"):
            result[curr].append("\"wood_door\"")


    elif readFile[i:i+4] == "<TR>":
        result.append([])
        curr += 1

for item in result:
    finalResult += "["
    finalResult += (",".join(item))
    finalResult += ","
    finalResult = finalResult[0:-1]
    finalResult += "],\n"
finalResult = finalResult[0:-2]
finalResult += "]"
writeFile.write(finalResult)
writeFile.close()
