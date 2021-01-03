var variables = {};
var blocks    = {};
var output    = "";

const dataType = {
    NUMBER : "number",
    STRING : "string"
    // NUMBER : "ꦮꦶꦭꦔꦤ꧀",
    // STRING : "ꦠꦸꦭꦶꦱꦤ꧀"
}

const opType = {
    VAR_DECLARE : "Declare variable",
    VAR_SET     : "Set value for variable",
    VAR_SETDEC  : "Declare and set variable",
    VAR_OPERATE : "Operate on variable",
    VAR_PRINT   : "Print value of variable"
}

const varOpType = {
    ADD : "add",
    SUB : "sub",
    MUL : "mul",
    DIV : "div",
    MOD : "mod"
}

const angka = [
    ["0", "꧐"], ["1", "꧑"], ["2", "꧒"],
    ["3", "꧓"], ["4", "꧔"], ["5", "꧕"],
    ["6", "꧖"], ["7", "꧗"], ["8", "꧘"],
    ["9", "꧙"]
];
var angka_to_number_regex = [];
for (var i in angka){
    var a = angka[i];
    angka_to_number_regex.push([RegExp( a[1], "g" ),a[0]]);
}
function angka_to_number(input){
    var res = input;
    for (var i in angka_to_number_regex){
        var pair = angka_to_number_regex[i];
        res = res.replace(pair[0],pair[1]);
    }
    return res;
}


function parseLine(line){
    
    // variable declaration
    if ((/^(ꦮꦺꦴꦤ꧀ꦠꦼꦤ꧀|ꦲꦤ).*꧈(ꦤꦶꦏꦸ|ꦲꦶꦏꦸ)/g).test(line)) {
        var declength = 0;
        if ((/^ꦮꦺꦴꦤ꧀ꦠꦼꦤ꧀/g).test(line)) { declength = 9;
        }else{ declength = 2; }
        var expr = line.substr(declength).split("꧈");
        var name = expr[0].replace(/\s/g, "");
        var type = "";
        switch (expr[1].substr(4)){ //both work
            case "ꦮꦶꦭꦔꦤ꧀":
                type = dataType.NUMBER;
                break;
            case "ꦠꦸꦭꦶꦱꦤ꧀":
                type = dataType.STRING;
                break;
        }
        return [opType.VAR_DECLARE,name,type];
    } 

    // variable initialization or set by value
    else if ( (/^(ꦒꦤ꧀ꦠꦶ|ꦒꦤ꧀ꦠꦺꦴꦱ꧀).+ꦢꦢꦶ/g).test(line) ) {
        var initlength = 0;
        if ((/^ꦒꦤ꧀ꦠꦶ/g).test(line)) { initlength = 5;
        }else{ initlength = 8; }
        var expr  = line.substr(initlength).split("ꦢꦢꦶ");
        var name  = expr[0].replace(/\s/g, "");
        var value = expr[1];
        return  [opType.VAR_SET, name, value];
    }

    // do operation on variable
    else if ( (/^ꦒꦤ꧀ꦠꦶ.+꧈/g).test(line) ) {
        var expr      = line.substr(5).split("꧈");
        var name      = expr[0].replace(/\s/g, "");
        var tooperate = expr[1];
        var operation;  var operand;
        if ((/^ꦠꦩ꧀ꦧꦃ/g).test(tooperate)){ //add
            operation = varOpType.ADD;
            operand   = tooperate.substr(5);
        }
        else if ((/^ꦏꦸꦫꦔꦶ/g).test(tooperate)){ //sub
            operation = varOpType.SUB;
            operand   = tooperate.substr(5);
        }
        return  [opType.VAR_OPERATE, name, [operation, operand]];
    }

    else if ( (/^ꦠꦸꦭꦶꦱ꧀/g).test(line) ) {
        var name  = line.substr(6);
        return  [opType.VAR_PRINT, name, ""];
    }

    else if ( (/^ꦒꦫꦶꦱ꧀ꦲꦚꦂ$/g).test(line) ) {
        return [opType.VAR_PRINT, "newline"];
    }

    else {
        throw "cannot parse " + line;
    }
};

function evalParsed(expr){
    var op    = expr[0];
    var name  = expr[1];
    var value = expr[2];

    switch (op) {
        case opType.VAR_DECLARE :
            if (value == dataType.NUMBER){
                variables[name] = [dataType.NUMBER, 0];
            }else if (value == dataType.STRING){
                variables[name] = [dataType.STRING, ""];
            }
            break;

        case opType.VAR_SET :
            var variable = variables[name];
            var type = variable[0];
            if (type == dataType.NUMBER){
                var angka = value.substr(1, value.length-2);
                var num   = Number(angka_to_number(angka));
                variables[name] = [type, num];
            }else if (type == dataType.STRING){
                var str = value.substr(1, value.length-2);
                variables[name] = [type, str];
            }
            break;

        case opType.VAR_OPERATE :
            var initial_variable = variables[name];
            var initial_value    = initial_variable[1];
            var variable_type    = initial_variable[0];
            if (initial_variable == undefined){
                throw "error undefined variable : " + name;
            }

            var operation = value[0];
            var operand   = value[1];
            var operand_val;
            if ((/^꧇.+꧇$/g).test(operand)){
                operand_val = angka_to_number(operand.substr(1,operand.length-2));
            }else{
                var operand_variable = variables[operand];
                if (operand_variable == undefined){
                    throw "undefined variable : " + operand;
                }
                operand_val = operand_variable[1];
            }
            var operation_result = 0;
            switch (operation){
                case varOpType.ADD:
                    if (variable_type == dataType.NUMBER){
                       operation_result = Number(initial_value) 
                                        + Number(operand_val);
                    }else if (variable_type == dataType.STRING){
                       operation_result = initial_value 
                                        + operand_val;
                    }else{
                        throw "undefined variable type : " + variable_type;
                    }
                    break;
                case varOpType.SUB:
                    operation_result = initial_value - operand_val;
                    break;
                default:
                    throw "undefined operand : " + operation;
                    break;
            }
            variables[name] = [variable_type, operation_result]
            break;

        case opType.VAR_PRINT :
            if (name == "newline"){
                output = output + "\n";
            }
            else if ( (/^꧊.+꧊$/g).test(name)){
                output = output + name.substr(1,name.length-2);
            }else{
                var variable = variables[name];
                output = output + variable[1];
            }
            break;

        default:
            throw "cannot evaluate " + op;
    }
}

function interpret(input){
    var raw    = input.replace(/[\n\r]/gm, "") // remove newline
                      .split("꧉")              // split by delim
                      .filter(Boolean);        // filter out emptystring
    var parsed = [];
    try{
        for (var i in raw){
            parsed.push(parseLine(raw[i]));
        }
        for (var i in parsed){
            evalParsed(parsed[i]);
        }
    }catch (err) {
        throw "on line " +String(Number(i)+1)+" : "+err;
    }


    console.log(raw);      //debug purposes
    console.log(parsed);
};

function runCode(input){
    variables = {};
    blocks    = {};
    output    = "";
    try {
        interpret(input);
    }catch(err){
        output = "Error\n" + err;
    }
    console.log(variables);
    console.log(output);
    return output;
}
