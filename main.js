function readCSVFile(inputFile) {
    const reader = new FileReader();
    var matrix = [];
    var headers = [];


    reader.onload = function(e) {
        
        const contents = e.target.result;
        const lines = contents.trim().split('\n');
        
        if (lines.length === 0) {
            console.error('Il file CSV è vuoto.');
            return;
        }
        
        // Rimuovi le virgolette doppie (") dagli header
        headers = lines[0].split(';').slice(0, -1).map(header => header.replace(/["']/g, '').trim());

        // ottenere i valori numerici
        for (var i = 1; i < lines.length; i++) {
            var values = lines[i].split(';').slice(0, -1).map(value => {
                // Sostituisci "/" con spazi vuoti
                return value.replace(/\//g, ' ').trim() === '' ? 0 : Number(value);
            });

            // Rimuovi il primo elemento dall'array dei valori
            values.shift();

            // Aggiungi i valori all'array della matrice
            matrix.push(values);
        }


        const container = document.getElementById("container");
        container.style.flexDirection = "column";
        container.style.marginTop = "0px";
        

        const inputContainer = document.getElementById("input-container");
        inputContainer.style.height = '10vh';
        inputContainer.style.width = '20vh';
        
        inputContainer.style.border = '0.5vh dashed rgb(29,29,78);';

        const textInput = document.getElementById("text-input");
        textInput.style.fontSize = '2vh';

        const fileContainer = document.getElementById("file-container");
        fileContainer.style.width = "10vh";
        fileContainer.style.height = "5vh";

        const label = document.getElementById("labelInput");
        label.style.fontSize = "1.5vh";

        // CREO LA TABELLA
        //console.log(matrix);
        //console.log(headers);
        createTable(headers, matrix);

        //CALCOLO DELLE COMBINAZIONI
        var groups = [];
        var combos = [];
        if(headers.length % 2 == 0){

            combos = combinations(headers, headers.length / 2);

        } else {

            const temp1 = combinations(headers, Math.floor(headers.length / 2));
            const temp2 = (combinations(headers, Math.ceil(headers.length / 2)));
            combos = [...temp1, ...temp2];
            
            //console.log(combos);
        }
            
            for(var i = 0; i < combos.length; i++) {

                var combinationMatrix = findRowAndheaders(matrix, combos[i], headers);
                var diffMatrix = findRowAndheaders(matrix, headers.filter(item => !combos[i].includes(item)), headers);
            
                var tempGroup = {
                gruppo1: combos[i],
                gruppo2: headers.filter(item => !combos[i].includes(item)),
                media: (
                        (averageMatrix(combinationMatrix) / combos[i].length) + 
                        (averageMatrix(diffMatrix) / (headers.length - combos[i].length))
                        ) / 2 };

                //console.log(tempGroup);
            
                groups.push(tempGroup);
            }
            
                //console.log(groups);

            //

            //COLORE LE COLONNE DEI GRUPPPI
            colorColumns(groups, headers);
            writeFileName(inputFile.name);
            
    };

    reader.readAsText(inputFile);
}

//-------------------------------------------------------------------------------------------------------------------------------------------------

//FUNZIONE PER DISEGNARE LA TABELLA DOPO LA LETTURA DEL CSV

function createTable(col, matrix) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = '';

    var table = document.createElement('table');
    table.setAttribute('id', 'myTable');
    var thead = table.createTHead();
    var tbody = table.createTBody();
  
    // Creazione delle intestazioni di colonna
    var headerRow = thead.insertRow();
    for (var i = 0; i < col.length; i++) {
        if(i == 0) {
            var th = document.createElement('th');
        th.textContent = '';
        headerRow.appendChild(th);
        }
        var th = document.createElement('th');
        th.textContent = col[i];
        headerRow.appendChild(th);
    }
  
    for (var i = 0; i < matrix.length; i++) {
        var row = tbody.insertRow();
        for (var j = 0; j < matrix[i].length; j++) {
            if(j == 0) {
                var cell = row.insertCell();
                cell.textContent = col[i];
            }
            var cell = row.insertCell();
            cell.textContent = matrix[i][j];
        }
    }
  
    tableContainer.appendChild(table);
}

//-------------------------------------------------------------------------------------------------------------------------------------------------

//FUNZIONE PER CALCOLARE TUTTE LE COMBINAZIONI DI k ELEMENTI

function combinations(arr, k) {
    const result = [];
    
    function generateCombination(start, combo) {
      if (combo.length === k) {
        result.push([...combo]);
        return;
      }
      
      for (let i = start; i < arr.length; i++) {
        combo.push(arr[i]);
        generateCombination(i + 1, combo);
        combo.pop();
      }
    }
    
    generateCombination(0, []);
    
    return result;
}

//-------------------------------------------------------------------------------------------------------------------------------------------------
// CALCOLO LA SOTTOMATRICE DEL GRUPPO PRESO IN CONSIDERAZIONE
  
function findRowAndheaders(matrix, comb, headers) {
    const submatrix = [];

    for (let i = 0; i < comb.length; i++) {
        const rowIndex = headers.indexOf(comb[i]);
        const newRow = [];

        if (rowIndex >= 0 && rowIndex < matrix.length) {
            for (let j = 0; j < comb.length; j++) {
                const columnIndex = headers.indexOf(comb[j]);

                if (columnIndex >= 0 && columnIndex < matrix[rowIndex].length) {
                    newRow.push(matrix[rowIndex][columnIndex]);
                }
            }
                submatrix.push(newRow);
        }
    }

    //console.log(submatrix)
    return submatrix;
}

//-------------------------------------------------------------------------------------------------------------------------------------------------
// CALCOLO DELLA SOMMA DELLA MATRICE
  
function averageMatrix(mtx){
    let sum = 0;

    for (let i = 0; i < mtx.length; i++) {
        for (let j = 0; j < mtx[i].length; j++) {
            if (!isNaN(mtx[i][j])) {
            sum += mtx[i][j];
            }
        }
    }

    return sum ;
}

//-------------------------------------------------------------------------------------------------------------------------------------------------
//FUNZIONE PER COLORARE LE COLONNE DEI GRUPPI MIGLIORI

function colorColumns(groups, headers){

    var groupMax = findMaxGroup(groups);
    var table = document.getElementById('myTable'); 
    
    //primo gruppo 

    var coppie1 = combinations(groupMax.gruppo1, 2);
    //console.log(coppie1);

    for(var i = 0; i < coppie1.length; i++){

        const couple = coppie1[i];
        const x = headers.indexOf(couple[0]);
        const y = headers.indexOf(couple[1]);

        table.rows[x+1].cells[y+1].style.backgroundColor = '#EA738D';
        table.rows[y+1].cells[x+1].style.backgroundColor = '#EA738D';
    }

    for(var i = 0; i < groupMax.gruppo1.length; i++){
        
        const x = headers.indexOf(groupMax.gruppo1[i]);
        table.rows[x+1].cells[x+1].style.backgroundColor = '#EA738D';
        
    }

    //secondo gruppo

    var coppie2 = combinations(groupMax.gruppo2, 2);
    //console.log(coppie2);
    

    for(var i = 0; i < coppie2.length; i++){
        const couple = coppie2[i];
        const x = headers.indexOf(couple[0]);
        const y = headers.indexOf(couple[1]);

        table.rows[x+1].cells[y+1].style.backgroundColor = '#89ABE3';
        table.rows[y+1].cells[x+1].style.backgroundColor = '#89ABE3';
    }

    for(var i = 0; i < groupMax.gruppo2.length; i++){
        const x = headers.indexOf(groupMax.gruppo2[i]);
        
        table.rows[x+1].cells[x+1].style.backgroundColor = '#89ABE3';
    }

    writeGroups(groupMax);

}

//-------------------------------------------------------------------------------------------------------------------------------------------------

//FUNZIONE CHE CALCOLA IL GRUPPO CON LA MEDIA MAGGIORE

function findMaxGroup(groups){
    //console.log(groups);
    const groupMaxAverage = groups.reduce((maxGroup, currentGroup) => {
        return currentGroup.media > maxGroup.media ? currentGroup : maxGroup;
      }, groups[0]); // Inizia con il primo oggetto come valore iniziale
      
    return groupMaxAverage;
      
}

//-------------------------------------------------------------------------------------------------------------------------------------------------
// FUNZIONE CHE MI SCRIVE I GRUPPI MIGLIORI CON LA LORO MEDIA

function writeGroups(groups) {
    const text = document.getElementById('result-container');
    
    var gruppo1String = groups.gruppo1.join(', '); 
    var gruppo2String = groups.gruppo2.join(', ');
    
    gruppo1String = '<span class="circle-sketch-highlight">' + gruppo1String + '</span>' + " ";
    gruppo2String = '<span class="circle-sketch-highlight">' + gruppo2String + '</span>';
    const media = '<span class="circle-sketch-highlight">' + groups.media.toFixed(3) + '</span>';
    
    text.innerHTML = "I team sono &nbsp;" + gruppo1String + "&nbsp; e &nbsp;" +
    gruppo2String + " &nbspcon una media pari &nbsp;" + media;
}

//-------------------------------------------------------------------------------------------------------------------------------------------------
// FUNZIONE CHE SCRIVE IL NOME DEL FILE CHE STO VISUALIZZANDO
function writeFileName(name){
    const text = document.getElementById('name-file');
    text.innerHTML = name;

}




  
