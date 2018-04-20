function mapTableReader() { 
    var table = $("#mapTable").children[0];
    var curr;
    var result = [];
    for (var i = 0; i < table.children.length; i++) {
        result[i] = [];
        for (var j = 0; j < table.children[i].children.length; j++) {
            curr = table.children[i].children[j];
            result[i][j] = ["grass"];
            if (curr.bgColor == "#408000")
                result[i][j].push("tree");
            else if (curr.bgColor == "#804000")
                result[i][j].push("village");
        }
    }
    
    return result;
}