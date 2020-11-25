function Relacion(origen, simbolo, destino) {
	this.origen = origen;
	this.destino = destino;
	this.simbolo = simbolo;
}
function Estado(val) {
	this.valor = val; // valor del nodo
}
function Automata() {
	this.relaciones = [];
	this.inicio = null;
	this.fin = null;
	this.alfabeto = [];
	this.estados = [];
	this.mapaDeTransiciones = new Map();
}
function Nodo(val) {
	this.valor = val;
	this.hijos = [];
	this.papa = null;
}
function Arbol() {
	this.raiz = null;
	this.nodoActual = null;
}

var EPSILON_CONST = "ϵ";
var VOID_SET = "VOID";

function AutomataFD(){
    this.relaciones = [];
	this.inicio = null;
    this.alfabeto = [];
    this.estados = new Map();
    this.mapaDeTransiciones = new Map();
}

function EstadoAFD(estado, aceptacion) {
    this.valor = estado;
    this.aceptacion = aceptacion;
}

Arbol.prototype.bfs = function (valor) {
	var queue = [this.raiz];
	while (queue.length) {
		var nodo = queue.shift();
		if (nodo === valor) {
			return nodo;
		}
		for (var i = 0; i < nodo.hijos.length; i++) {
			queue.push(nodo.hijos[i]);
		}
	}
	return null;
};
Arbol.prototype.agregar = function (valor, nodoDestino) {
	var nodo = new Nodo(valor);
	var papa = nodoDestino ? this.bfs(nodoDestino) : null;
	if (papa) {
		nodo.papa = nodoDestino;
		papa.hijos.push(nodo);
		this.nodoActual = nodo;
	}
	else if (!this.raiz) {
		this.raiz = nodo;
	}
	else {
		throw new Error('Raiz ya esta definida');
	}
};

Arbol.prototype.mostrar = function () {
	const div = document.createElement('div');
	div.innerHTML += "<p>*********************</p>";
	var queue = [this.raiz];
	while (queue.length) {
		hijos = "";
		var nodo = queue.shift();
		div.innerHTML += "<p>-" + nodo.valor + "</p>";
		for (var i = 0; i < nodo.hijos.length; i++) {
			queue.push(nodo.hijos[i]);
			hijos += nodo.hijos[i].valor + " ";
		}
		div.innerHTML += "<p>--" + hijos + "</p>";
	}
	document.getElementById('content').appendChild(div);
	return null;
};

function generarAutomatas(expR1, expR2) {
	resultado = [];
	expresiones = [expR1, expR2];
	for (var h = 0; h < expresiones.length; h++) {
		expR = expresiones[h];

		//inicializar arbol
		arbol = new Arbol();
		arbol.raiz = new Nodo("1");
		arbol.nodoActual = arbol.raiz;

		nodoActual = arbol.raiz;
		esConcatenacion = false;
		caracterAnterior = ''; 
		//iterar expresion
		for (var i = 0; i < expR.length; i++) {
			if(i>0){
				caracterAnterior = expR.charAt(i-1);
			}
			switch(expR.charAt(i)){
				case ' ':
				break;
				case '(':
					arbol.agregar("x", arbol.nodoActual);
					esConcatenacion = false;
				break;
				case '+':
					arbol.nodoActual.valor = expR.charAt(i);
					arbol.agregar("?", arbol.nodoActual);
					esConcatenacion = false;
				break;
				case '*':
					//definir nueva raiz
					if(arbol.nodoActual === arbol.raiz){
						nodo = new Nodo("borrame");
						nodo.hijos.push(arbol.nodoActual);
						arbol.nodoActual.papa = nodo;
						arbol.raiz = nodo;
					}
					arbol.nodoActual.valor = expR.charAt(i);
					arbol.nodoActual = arbol.nodoActual.papa;
					esConcatenacion = true;
				break;
				case ')':
					//definir nueva raiz
					if(arbol.nodoActual === arbol.raiz){
						nodo = new Nodo("borrame");
						nodo.hijos.push(arbol.nodoActual);
						arbol.nodoActual.papa = nodo;
						arbol.raiz = nodo;
					}
					arbol.nodoActual = arbol.nodoActual.papa;
					esConcatenacion = true;
				break;
				default:
				if(arbol.nodoActual === arbol.raiz){
					nodo = new Nodo("borrame");
					nodo.hijos.push(arbol.nodoActual);
					arbol.nodoActual.papa = nodo;
					arbol.raiz = nodo;
				}
				if(esConcatenacion){
					arbol.nodoActual.valor = ".";
					arbol.agregar("?", arbol.nodoActual);
				}
				esConcatenacion = true;
				arbol.nodoActual.valor = expR.charAt(i);
				if(i < expR.length - 1 && expR.charAt(i + 1) == "*"){
					indiceNodo = arbol.nodoActual.papa.hijos.indexOf(arbol.nodoActual);
					arbol.nodoActual.papa.hijos.splice(indiceNodo,1);
					nodoAnterior = arbol.nodoActual;
					arbol.agregar("?", nodoAnterior.papa);
					arbol.nodoActual.hijos.push(nodoAnterior);
				}else{
					arbol.nodoActual = arbol.nodoActual.papa;
				}
				break;
			}
			
		}
		if(arbol.raiz.valor == "borrame"){
			arbol.raiz = arbol.raiz.hijos[0];
			arbol.raiz.papa = null;
		}
		
		numEstado = 0;
		function agregarEstado() {
			numEstado++;
			automata.estados.push(numEstado.toString());
			return new Estado(numEstado);
		}

		//Inicializar automata
		automata = new Automata();
		estadoInicial = agregarEstado();
		estadoFinal = agregarEstado();
		relacion = new Relacion(estadoInicial, arbol.raiz, estadoFinal);
		automata.relaciones.push(relacion);
		automata.inicio = estadoInicial;
		automata.fin = estadoFinal;

		for(var i = 0; i < automata.relaciones.length; i++){
			if(automata.relaciones[i] == null){
				continue;
			}
			switch(automata.relaciones[i].simbolo.valor){
				case '.':
					estadoAnterior = automata.relaciones[i].origen;
					for(var j = 0; j < automata.relaciones[i].simbolo.hijos.length; j++){
						if(j == automata.relaciones[i].simbolo.hijos.length - 1){
							estadoDestino = automata.relaciones[i].destino;
						}else{
							estadoDestino = agregarEstado();
						}
						automata.relaciones.push(new Relacion(estadoAnterior, automata.relaciones[i].simbolo.hijos[j], estadoDestino));
						estadoAnterior = estadoDestino;
					}
					automata.relaciones[i] = null;
					i = 0;
				break;
				case '+':
					estadoAnterior = automata.relaciones[i].origen;
					estadoDestino = automata.relaciones[i].destino;
					for(var j = 0; j < automata.relaciones[i].simbolo.hijos.length; j++){
						automata.relaciones.push(new Relacion(estadoAnterior, automata.relaciones[i].simbolo.hijos[j], estadoDestino));
					}
					automata.relaciones[i] = null;
					i = 0;
				break;
				case '*':
					//Se espera que solo tenga un hijo
					estadoAnterior = automata.relaciones[i].origen;
					estadoIntermedio = agregarEstado();
					estadoDestino = automata.relaciones[i].destino;
					automata.relaciones.push(new Relacion(estadoAnterior, new Nodo(EPSILON_CONST), estadoIntermedio));
					automata.relaciones.push(new Relacion(estadoIntermedio, new Nodo(EPSILON_CONST), estadoDestino));
					automata.relaciones.push(new Relacion(estadoIntermedio, automata.relaciones[i].simbolo.hijos[0], estadoIntermedio));
					automata.relaciones[i] = null;
					i = 0;
				break;
				default:
					if(!automata.alfabeto.includes(automata.relaciones[i].simbolo.valor)){
						if(automata.relaciones[i].simbolo.valor != EPSILON_CONST) {
							automata.alfabeto.push(automata.relaciones[i].simbolo.valor);
						}						
					}
				break;
			}
		}
		automata.relaciones = automata.relaciones.filter(function(r){ return r != null; });
		resultado[h] = automata;
	}
	return resultado;
}

function obtenerCerraduraEpsilon(state, arregloDeMapaDeTransiciones) {
    var epsilonClosureSet = new Set();
    epsilonClosureSet = obtenerCerraduraEpsilonRecursivo("", state, epsilonClosureSet, arregloDeMapaDeTransiciones);
    var epsilonClosureArray = Array.from(epsilonClosureSet);
    return epsilonClosureArray;
}

function obtenerCerraduraEpsilonRecursivo(initialState, state, returnSet, arregloDeMapaDeTransiciones) {
    var emptyTransitionsExist = false;
    if(arregloDeMapaDeTransiciones.has(state)) {
        emptyTransitionsExist = arregloDeMapaDeTransiciones.get(state).has(EPSILON_CONST);
    }    
    
    if( state == initialState || !emptyTransitionsExist || returnSet.has(state) ){        
        returnSet.add(state);
        return returnSet;
    }
    returnSet.add(state);
    var stateTransitionsMap = arregloDeMapaDeTransiciones.get(state);
    var emptyTransitionsArray = stateTransitionsMap.get(EPSILON_CONST);
    emptyTransitionsArray.forEach(function(value){
        obtenerCerraduraEpsilonRecursivo(state, value, returnSet, arregloDeMapaDeTransiciones);
    });
    return returnSet;
}

function crearMapaDeTransicionPorEstado(automataFN) {
    var mapaDeMapaDeTransicion = new Map();
    automataFN.relaciones.forEach(function(transicion){  
		var origen = transicion.origen.valor.toString();
		var destino = transicion.destino.valor.toString();
		var simbolo = transicion.simbolo.valor;
		//console.log("Origen: "+origen+ ", destino: "+destino+", simbolo: "+simbolo );

        if(mapaDeMapaDeTransicion.has(origen)){
            var mapaDeTransicionAuxiliar = mapaDeMapaDeTransicion.get(origen);
            if(mapaDeTransicionAuxiliar.has(simbolo)){
                transiciones = mapaDeTransicionAuxiliar.get(simbolo);
                transiciones.push(destino)
            }
            else {
                mapaDeTransicionAuxiliar.set(simbolo, [destino])
            }
        }
        else {
            var mapaDeTransicionDeEstado = new Map()
            mapaDeTransicionDeEstado.set(simbolo, [destino])
            mapaDeMapaDeTransicion.set(origen, mapaDeTransicionDeEstado)
        }
    }); 
    return mapaDeMapaDeTransicion;
}

function crearMapaDeTransicionAumentadaDelta(automata) {
    var statesInAutomata = automata.estados;
    var alphabet = automata.alfabeto;
    var newTransitionsMapArray = new Map();
    var mapaDeMapaDeTransiciones = automata.mapaDeTransiciones
    statesInAutomata.forEach(function(stateInAutomata){
        newTransitionsMapArray.set(stateInAutomata, new Map());
        epsilonClosureArray = obtenerCerraduraEpsilon(stateInAutomata, mapaDeMapaDeTransiciones);

        alphabet.forEach(function(withSymbol){
            var newStatesToTransitionArray = [];
            var newStatesToTransitionSet = new Set();

            epsilonClosureArray.forEach(function(stateInEpsilonArray){
                var stateTransitionsMap = new Map();
                if(mapaDeMapaDeTransiciones.has(stateInEpsilonArray)){
                    stateTransitionsMap = mapaDeMapaDeTransiciones.get(stateInEpsilonArray);
                }
                if(stateTransitionsMap.has(withSymbol)){
                    var toStatesArray = stateTransitionsMap.get(withSymbol);
                    toStatesArray.forEach(function(value) {
                        var auxEpsilonClosureArray = obtenerCerraduraEpsilon(value, mapaDeMapaDeTransiciones);
                        auxEpsilonClosureArray.forEach(function(value) {
                            newStatesToTransitionSet.add(value);
                        });                        
                    });
                }    
            });
            
            newStatesToTransitionArray = Array.from(newStatesToTransitionSet);
            if(newStatesToTransitionArray.length == 0){
                newStatesToTransitionArray.push(VOID_SET);
            }
            auxMap = newTransitionsMapArray.get(stateInAutomata);
            auxMap.set(withSymbol, newStatesToTransitionArray.sort());
        });        
    });
    return newTransitionsMapArray;
}

function crearTransicionDeEstadoAEstado(estado, simbolo, mapaDeTrasicionAumentadaDelta) {    
    var stateSet = new Set();
    var stateArray = estado.split(",");
    stateArray.forEach(function(estadoEnArreglo) {           
        if(estadoEnArreglo != VOID_SET && mapaDeTrasicionAumentadaDelta.get(estadoEnArreglo).has(simbolo)) {
            var auxArray = mapaDeTrasicionAumentadaDelta.get(estadoEnArreglo).get(simbolo);
            auxArray.forEach(function(estadoValor){
                if(estadoValor != VOID_SET) {
                    stateSet.add(estadoValor);
                }
            });  
        } 

    });
    arregloDeTransicion = Array.from(stateSet);
    if(arregloDeTransicion.length == 0){
        arregloDeTransicion.push(VOID_SET)
    }
    return arregloDeTransicion.join(",");
}

function crearAFDConAFNyTransicionesDeltaRecursivo(dfaMap, estadoInicial, alfabeto, mapaDeTrasicionAumentadaDelta) {    
    if(dfaMap.has(estadoInicial) || estadoInicial == VOID_SET){
        return;
    }    
    dfaMap.set(estadoInicial, new Map());
    alfabeto.forEach(function(conSimbolo){            
        aEstado = crearTransicionDeEstadoAEstado(estadoInicial, conSimbolo, mapaDeTrasicionAumentadaDelta);            
        var auxMap = dfaMap.get(estadoInicial);
        auxMap.set(conSimbolo, aEstado);
        crearAFDConAFNyTransicionesDeltaRecursivo(dfaMap, aEstado, alfabeto, mapaDeTrasicionAumentadaDelta);
    });        
}

function crearAFDConAFNyTransicionesDelta(automataFN, mapaDeTrasicionAumentadaDelta) {
    var dfaMap = new Map();
    crearAFDConAFNyTransicionesDeltaRecursivo(dfaMap, automataFN.inicio.valor.toString(), automataFN.alfabeto, mapaDeTrasicionAumentadaDelta);
    
    var automataFD = new AutomataFD();
    automataFD.inicio = automataFN.inicio.valor.toString();
    automataFD.alfabeto = automataFN.alfabeto;
    var estadoAceptacion = automataFN.fin.valor.toString();
    var estadoVoidExiste = false;
    dfaMap.forEach(function(transitionMap, estado){
        var estadoDeAceptacion = false;
        transitionMap.forEach(function(aEstado, simbolo){
            automataFD.relaciones.push(new Relacion(estado, simbolo, aEstado));    
            if(aEstado == VOID_SET) {
                estadoVoidExiste = true;
            }
        });

        estadosOriginales = estado.split(",");
        if(estadosOriginales.find(function(estado){ return estado == estadoAceptacion;})) {
            estadoDeAceptacion = true;
        }
        automataFD.estados.set(estado, estadoDeAceptacion);        
    });

    if(estadoVoidExiste) {
        var auxMap = new Map();
        automataFD.alfabeto.forEach(function(simbolo){
            auxMap.set(simbolo, VOID_SET);
            automataFD.relaciones.push(new Relacion(VOID_SET, simbolo, VOID_SET));    
        });
        dfaMap.set(VOID_SET, auxMap);
        automataFD.estados.set(VOID_SET, false);        
    }

    automataFD.mapaDeTransiciones = dfaMap;
    return automataFD;
}

function convertirAutomataFNToAutomataFD(automata) {    
    var mapaDeTrasicionAumentadaDelta = crearMapaDeTransicionAumentadaDelta(automata, automata.mapaDeTransiciones);
    var automataFD = crearAFDConAFNyTransicionesDelta(automata, mapaDeTrasicionAumentadaDelta);
    return automataFD;
}

function iniciarProcesoDeComparacionDeAutomatas(automataFN1, automataFN2) {
	//console.log("Proceso iniciado");
	automataFN1.mapaDeTransiciones = crearMapaDeTransicionPorEstado(automataFN1);
	var aceptaEpsilon = aceptaCadenaVacia(automataFN1);
	var automataFD1 = convertirAutomataFNToAutomataFD(automataFN1);
	if(aceptaEpsilon){
		automataFD1.estados.set(automataFD1.inicio, true);
	}
	
	automataFN2.mapaDeTransiciones = crearMapaDeTransicionPorEstado(automataFN2);
	var aceptaEpsilon2 = aceptaCadenaVacia(automataFN2);
	var automataFD2 = convertirAutomataFNToAutomataFD(automataFN2);
	if(aceptaEpsilon2){
		automataFD2.estados.set(automataFD2.inicio, true);
	}
	
	console.log("AFDs");
	console.log(automataFD1);
	console.log(automataFD2);
	
	var noSonEquivalentes = sonAutomatasNoEquivalentes(automataFD1, automataFD2);
    return !noSonEquivalentes;
}

function aceptaCadenaVacia(automataFN) {
	return aceptaCadenaVaciaRecursivo(automataFN, automataFN.inicio.valor.toString(), automataFN.fin.valor.toString());
}

function aceptaCadenaVaciaRecursivo(automataFN, estadoInicial, estadoDeAceptacion) {
	//console.log("Estado Inicial: " + estadoInicial + ", Aceptacion: " + estadoDeAceptacion);
	if(estadoInicial == estadoDeAceptacion) {
		return true;
	}

	if(automataFN.mapaDeTransiciones.has(estadoInicial)) {		
		if(automataFN.mapaDeTransiciones.get(estadoInicial).has(EPSILON_CONST)) {
			//console.log("Tiene transicion epsilon en: " +estadoInicial);
			arregloDeEstados = automataFN.mapaDeTransiciones.get(estadoInicial).get(EPSILON_CONST)
			for(i=0; i<arregloDeEstados.length; i++){
				var nuevoEstado	= arregloDeEstados[i];
				return aceptaCadenaVaciaRecursivo(automataFN, nuevoEstado, estadoDeAceptacion);
			}
		}
		else {
			//console.log("NO Tiene transicion epsilon en: " +estadoInicial);
			return false;
		}
	}
	else {
		//console.log("No existe estado: "+ estadoInicial);
		return false;
	}
}

function sonAlfabetosIguales(alfabeto1, alfabeto2) {
    if(alfabeto1.length != alfabeto2.length) {
        return false;
    }
    for(i = 0; i < alfabeto1.length; i++){
        simbolo1 = alfabeto1[i];
        var auxSimboloEncontrado = alfabeto2.find(function(simbolo2){ return simbolo1 == simbolo2; });
        if(auxSimboloEncontrado == undefined) {
            return false;
        }
    }
    return true;
}

function sonAutomatasNoEquivalentes(automata1, automata2){    
    var estadoInicial1 = automata1.inicio;
    var estadoInicial2 = automata2.inicio;
    var estadosValidadosSet = new Set();

    var sonIguales = sonAlfabetosIguales(automata1.alfabeto, automata2.alfabeto);
    if(!sonIguales){
        return true;
    }
    return sonAutomatasNoEquivalentesRecursivo(estadosValidadosSet, "", "", automata1, estadoInicial1, automata2, estadoInicial2);    
}

function sonAutomatasNoEquivalentesRecursivo(estadosValidadosSet, estadoOrigen1, estadoOrigen2, automata1, estado1, automata2, estado2) {    
    //console.log("INICIO Estados Origen: " +estadoOrigen1+ ", " + estadoOrigen2+ " / To Estados: "+estado1+", "+estado2);
    if((estadoOrigen1 == estado1 && estadoOrigen2 == estado2) || estadosValidadosSet.has(estado1+","+estado2) ) {
        //console.log("Primera condicion");
        return false;
    }

    if(automata1.estados.get(estado1) != automata2.estados.get(estado2) ){
        //console.log("Segunda condicion");
        return true;
    }

    var alfabeto = automata1.alfabeto;    
    for(i=0; i < alfabeto.length; i++){
        var simbolo = alfabeto[i];
        var nuevoEstado1 = automata1.mapaDeTransiciones.get(estado1).get(simbolo);
        var nuevoEstado2 = automata2.mapaDeTransiciones.get(estado2).get(simbolo);
        //console.log("CON Simbolo: "+simbolo);
        //console.log(estadosValidadosSet);
        if(sonAutomatasNoEquivalentesRecursivo(estadosValidadosSet, estado1, estado2, automata1, nuevoEstado1, automata2, nuevoEstado2)) {
            return true;
        }
    }
    
    estadosValidadosSet.add(estado1+","+estado2)
    return false;
}

function compararExpresiones(expR1, expR2){
	automatas = generarAutomatas(expR1, expR2);
	console.log(automatas[0]);
	console.log(automatas[1]);
	//var resultado = iniciarProcesoDeComparacionDeAutomatas(automatas[0], automatas[1]);	

	var automataFN1 = automatas[0];
	var automataFN2 = automatas[1];

	automataFN1.mapaDeTransiciones = crearMapaDeTransicionPorEstado(automataFN1);
	var aceptaEpsilon = aceptaCadenaVacia(automataFN1);
	var automataFD1 = convertirAutomataFNToAutomataFD(automataFN1);
	if(aceptaEpsilon){
		automataFD1.estados.set(automataFD1.inicio, true);
	}
	
	automataFN2.mapaDeTransiciones = crearMapaDeTransicionPorEstado(automataFN2);
	var aceptaEpsilon2 = aceptaCadenaVacia(automataFN2);
	var automataFD2 = convertirAutomataFNToAutomataFD(automataFN2);
	if(aceptaEpsilon2){
		automataFD2.estados.set(automataFD2.inicio, true);
	}
	
	console.log("AFDs");
	console.log(automataFD1);
	console.log(automataFD2);
	
	var noSonEquivalentes = sonAutomatasNoEquivalentes(automataFD1, automataFD2);
	//return !noSonEquivalentes;
	if(!noSonEquivalentes){
		window.alert("Expresiones son equivalentes");
	}
	else {
		window.alert("Expresiones NO son equivalentes");
	}
	
	crearTablaDeResultados(!noSonEquivalentes, automataFN1, automataFN2, automataFD1, automataFD2, expR1, expR2);
}

function crearNodoTexto(texto) {
	return document.createTextNode(texto);
}

function crearParrafoConTexto(texto){
	var parrafo = document.createElement("p");
	parrafo.appendChild(crearNodoTexto(texto));
	return parrafo;
}

function crearSpan(texto){
	var span = document.createElement("span");
	span.appendChild(crearNodoTexto(texto));
	span.appendChild(document.createElement("br"));
	return span;
}

function crearContenidoParaAutomata(automata, titulo, tipoDeAutomata) {
	var div = document.createElement("div");	
	var estadoInicial;
	var estadoFinal;
	var estadosAutomata;
	var estadosAceptacion;	

	div.appendChild(crearParrafoConTexto(titulo));

	if(tipoDeAutomata == "AFN"){
		estadoInicial = automata.inicio.valor;
		estadoFinal = automata.fin.valor;
		estadosAutomataAux = "";		
		estadosAutomata = "Estados: [ " + automata.estados.join(", ") + " ]";
		estadosAceptacion = "Estados de Aceptacion: [ " + estadoFinal + " ]"; 
	}
	else {
		estadoInicial = automata.inicio;
		var estadosArray = [];
		var estadosAceptacionArray = [];
		automata.estados.forEach(function(aceptacion, estado) {
			console.log(estado);
			var estadoSinComas = estado.replaceAll(",", "");
			estadosArray.push(estadoSinComas);
			if(aceptacion){
				estadosAceptacionArray.push(estadoSinComas);
			}			
		});
		estadosAutomata = "Estados: [ " + estadosArray.join(", ") + " ]";
		estadosAceptacion = "Estados de Aceptacion: [ " + estadosAceptacionArray.join(", ") + " ]"; 
	}
	div.appendChild(crearParrafoConTexto("Estado Inicial: " + estadoInicial));

	var alfabetoString = "Alfabeto: [ " + automata.alfabeto.join(", ") + "]";	
	div.appendChild(crearParrafoConTexto(alfabetoString));
	div.appendChild(crearParrafoConTexto(estadosAutomata));
	div.appendChild(crearParrafoConTexto(estadosAceptacion));

	var divTransiciones = document.createElement("div");
	divTransiciones.appendChild(crearParrafoConTexto("Transiciones"));
	automata.mapaDeTransiciones.forEach(function(transicion, estado){
		divTransiciones.appendChild(crearParrafoConTexto("De Estado: " + estado));
		transicion.forEach(function(aEstado, simbolo){
			divTransiciones.appendChild(crearParrafoConTexto("Con simbolo: " + simbolo + ", a estado: " + aEstado));
		});
	});
	div.appendChild(divTransiciones);
	return div;
}

function limpiarDivs() {	
	var divToRemove = document.getElementById('automataFN1').firstChild;
	if(divToRemove != null) {
		document.getElementById('automataFN1').removeChild(divToRemove);
		var divToRemove = document.getElementById('automataFN2').firstChild;
		document.getElementById('automataFN2').removeChild(divToRemove);
		var divToRemove = document.getElementById('automataFD1').firstChild;
		document.getElementById('automataFD1').removeChild(divToRemove);
		var divToRemove = document.getElementById('automataFD2').firstChild;
		document.getElementById('automataFD2').removeChild(divToRemove);
	}
}

function crearTablaDeResultados(sonEquivalentes, automataFN1, automataFN2, automataFD1, automataFD2, expR1, expR2){
	
	limpiarDivs();
	var expresionesEquivalentesString = "";
	if(sonEquivalentes){
		expresionesEquivalentesString = "Expresiones son equivalentes";
	}
	else {
		expresionesEquivalentesString = "Expresiones NO son equivalentes";
	}
	document.getElementById('resultadoDeValidacion').innerHTML = expresionesEquivalentesString;

	var htmlDiv = crearContenidoParaAutomata(automataFN1, "AFN Para Expresion " + expR1, "AFN");
	document.getElementById('automataFN1').appendChild(htmlDiv);
	var htmlDiv = crearContenidoParaAutomata(automataFD1, "AFD Para Expresion " + expR1, "AFD");
	document.getElementById('automataFD1').appendChild(htmlDiv);
	var htmlDiv = crearContenidoParaAutomata(automataFN2, "AFN Para Expresion " + expR2, "AFN");
	document.getElementById('automataFN2').appendChild(htmlDiv);
	var htmlDiv = crearContenidoParaAutomata(automataFD2, "AFD Para Expresion " + expR2, "AFD");
	document.getElementById('automataFD2').appendChild(htmlDiv);
}