let candidates
let parties
let candidateCreator


setUpHandlers()


function setUpHandlers(){
    document.getElementById("showAllCandidatesBtn").onclick = getAllCandidates
    document.getElementById("candidateList").onclick = sortCandidateList
    document.getElementById("submitBtn").onclick = confirmCandidateCreationUpdate
    document.getElementById("cancelBtn").onclick = cancelCandidateCreationUpdate
    document.getElementById("createNewCandidate").onclick = createUpdateCandidate
    document.getElementById("resultBtn").onclick = showResult
}

function setUpListHandlers(){
    for(let i = 0; i < candidates.length; i++){
        document.getElementById("update_" + i).onclick = createUpdateCandidate
        document.getElementById("delete_" + i).onclick = deleteCandidate
    }
}

async function getAllCandidates(){
    const response = await fetch("http://localhost:8081/candidates")
    candidates = await response.json()
    updateCandidateList()
}

function updateCandidateList(){
    const candidateList = document.getElementById("candidateList")

    document.getElementById("candidateListHint").style.display = "initial"
    document.getElementById("candidateList").style.display = "initial"

    let candidateListHtml = getCandidateListHeaderHtml()
    for(let i = 0; i < candidates.length; i++){
        candidateListHtml += getCandidateTableItemHtml(candidates[i], i)
    }
    candidateList.innerHTML = candidateListHtml

    setUpListHandlers()


}

function getCandidateListHeaderHtml(){
    return  `<tr>
                <th id="firstName">Fornavn</th>
                <th id="surName">Efternavn</th>
                <th id="party">Parti</th>
            </tr>`

}

function getCandidateTableItemHtml(candidate, row){

    let returnHtml =    `<tr>
                        <td>${candidate.firstName}</td>
                        <td>`

    if(candidate.middleName !== null){
        returnHtml += `${candidate.middleName} `
    }

    returnHtml +=   `${candidate.surName}</td>
                    <td>${candidate.party.partyName}</td>
                    <td><button id="update_${row}" data-row="${row}">Opdater</button></td>
                    <td><button id="delete_${row}" data-row="${row}">Slet</button></td>
                    </tr>`
    return returnHtml
}

function sortCandidateList(ev){

    const danishCollator = new Intl.Collator("da")

    if(ev.target.id === "firstName"){
        candidates.sort((o1, o2) => {
            return danishCollator.compare(o1.firstName, o2.firstName)
        })
    }
    else if(ev.target.id === "surName"){
        candidates.sort((o1, o2) => {
            let o1Name = o1.middleName ? o1.middleName : o1.surName
            let o2Name = o2.middleName ? o2.middleName : o2.surName

            return danishCollator.compare(o1Name, o2Name)
        })
    }
    else if(ev.target.id === "party"){
        candidates.sort((o1, o2) => {
            return danishCollator.compare(o1.party.partyName, o2.party.partyName)
        })
    }
    updateCandidateList()
}

async function fetchPartyList(){
    const response = await fetch("http://localhost:8081/parties")
    parties = await response.json()

    generatePartyListHtml()
}

function generatePartyListHtml(){
    const partyList = document.getElementById("partyList")

    let partyListHtml = ""

    for(const party of parties){
        partyListHtml += `<button onclick="chooseParty(${party.id})">${party.partyName}</button><br>`
    }

    partyList.innerHTML = partyListHtml
}

async function createUpdateCandidate(ev){
    const row = ev.target.dataset.row
    ev.target.dataset.row = "-1"
    candidateCreator = makeCandidateCreator()

    if(row !== "-1") {
        candidateCreator.setCandidateId(candidates[row].id)
    }

    await fetchPartyList()
    const candidateForm = document.getElementById("candidateForm")

    candidateForm.style.display = "initial"
}

async function deleteCandidate(ev){
    const row = ev.target.dataset.row
    const id = candidates[row].id

    const options = {
        method: "DELETE",
        headers: {
            'Accept': 'application/json',
        }
    }

    await fetch("http://localhost:8081/candidate/" + id, options)

    //Could do this much smarter
    await getAllCandidates()
}

async function confirmCandidateCreationUpdate(ev){
    ev.preventDefault()
    const firstName = document.getElementById("firstNameInput").value
    const middleName = document.getElementById("middleNameInput").value
    const surName = document.getElementById("surNameInput").value

    candidateCreator.setFirstName(firstName)
    candidateCreator.setMiddleName(middleName)
    candidateCreator.setSurName(surName)

    document.getElementById("candidateForm").style.display = "none"
    document.getElementById("partyBox").style.display = "initial"
}

function cancelCandidateCreationUpdate(){
    const candidateForm = document.getElementById("candidateForm")
    candidateForm.style.display = "none"
    candidateForm.dataset.row = "0"
}

async function chooseParty(partyId){
    candidateCreator.setPartyId(partyId)

    console.log(candidateCreator.getCandidateId())

    if(candidateCreator.getCandidateId() == null){
        await postCandidate()
    }
    else {
        await putCandidate()
    }
    document.getElementById("partyBox").style.display = "none"

    //Could do this much smarter
    await getAllCandidates()
}

async function postCandidate(){
    const firstName = candidateCreator.getFirstName()
    const middleName = candidateCreator.getMiddleName()
    const surName = candidateCreator.getSurName()
    const partyId = candidateCreator.getPartyId()

    const options = {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            firstName: firstName,
            middleName: middleName,
            surName: surName,
            partyId: partyId,

        })
    }
    await fetch("http://localhost:8081/candidate", options)
}

async function putCandidate(){
    const firstName = candidateCreator.getFirstName()
    const middleName = candidateCreator.getMiddleName()
    const surName = candidateCreator.getSurName()
    const partyId = candidateCreator.getPartyId()
    const candidateId = candidateCreator.getCandidateId()

    const options = {
        method: "PUT",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            firstName: firstName,
            middleName: middleName,
            surName: surName,
            partyId: partyId,
            id: candidateId
        })
    }
    await fetch("http://localhost:8081/candidate", options)
}


function makeCandidateCreator(){
    let firstName
    let middleName
    let surName
    let partyId
    let candidateId

    return {
        setFirstName: (data) => {
            firstName = data
        },

        getFirstName: () => {
            return firstName
        },

        setMiddleName: (data) => {
            middleName = data
        },

        getMiddleName: () => {
            return middleName
        },

        setSurName: (data) => {
            surName = data
        },

        getSurName: () => {
            return surName
        },

        setPartyId: (data) => {
            partyId = data
        },

        getPartyId: () => {
            return partyId
        },


        setCandidateId: (data) => {
            candidateId = data
        },

        getCandidateId: () => {
            return candidateId
        }
    }
}

async function showResult(){
    hideCandidateList()

    const response = await fetch("http://localhost:8081/parties")
    const parties = await response.json()

    let resultHtml = setupResultHtmlHead()
    resultHtml += setUpResultHtml(parties)
    document.getElementById("resultTable").innerHTML = resultHtml
}

function setUpResultHtml(parties){
    let totalVotes = 0

    for(const party of parties){
        totalVotes += party.votes
    }

    let resultHtml = ""

    for(const party of parties){
        let percentOfVotes = ((party.votes/totalVotes)*100).toFixed(2)

        resultHtml +=
            `<tr>
                <td>${party.partyName}</td>
                <td>${party.votes}</td>
                <td>${percentOfVotes} %</td>
            </tr>`
    }

    return resultHtml
}

function setupResultHtmlHead(){
    return  `<tr>
                <th>Partinavn</th>
                <th>Antal stemmer</th>
                <th>Stemmeprocent</th>
            </tr>`
}

function hideCandidateList(){
    document.getElementById("candidateList").style.display = "none"

}