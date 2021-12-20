fetchTest()

async function fetchTest(){
    const response = await fetch("http://localhost:8081/candidate/1")
    const data = await response.json()

    console.log(data.id)
}