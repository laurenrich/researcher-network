const nodeName = sessionStorage.getItem('nodeName')
const currentGraph = sessionStorage.getItem('currentGraph')
const nodeType = sessionStorage.getItem('nodeType')
const nameText = document.getElementById("name-text")
const termsHeader = document.getElementById("terms-header")
const termsText = document.getElementById("terms-text")
const summaryHeader = document.getElementById("summary-header")
const summaryText = document.getElementById("summary-text")
const contentSect = document.getElementById("content-section")

//header title
nameText.textContent = nodeName
//page title
const pageTitle = document.createElement("title")
pageTitle.textContent = nodeName
document.head.appendChild(pageTitle)

d3.json("nodeinfo.json").then(data => {

    const nodeMap = new Map()
    if(currentGraph == "Domain"){
        data.domainInfo.forEach(domain => {
            nodeMap.set(domain.name, {
                terms: domain.terms,
                shortsummary: domain.shortsummary,
                summary: domain.summary,
                sizerank: domain.sizerank
            })
        })
    }else{
        data.methodInfo.forEach(method => {
            nodeMap.set(method.name, {
                terms: method.terms,
                shortsummary: method.shortsummary,
                summary: method.summary,
                sizerank: method.sizerank
            })
        })
    }


    if(nodeType === 'Faculty'){
        const facultyMap = new Map();

        if(currentGraph === 'Domain'){
            data.facultyInfoDomain.forEach(faculty => {
                facultyMap.set(faculty.name, {
                    terms: faculty.terms,
                    summary: faculty.summary
                })
            })
        }else{
            data.facultyInfoMethod.forEach(faculty => {
                facultyMap.set(faculty.name, {
                    terms: faculty.terms,
                    summary: faculty.summary
                })
            })
        }
        const curFac = facultyMap.get(nodeName)
        termsHeader.textContent = "Frequent MeSH terms"
        termsText.textContent = curFac.terms
        summaryHeader.textContent = "Research Interests"
        summaryText.textContent = curFac.summary

        const topicsDiv = document.createElement("div")
        topicsDiv.id = 'topics-container'
        contentSect.appendChild(topicsDiv)
        const topicsContentDiv = document.createElement("div")
        topicsContentDiv.id = "topics-content"
        const topicHeader = document.createElement("h2")
        topicHeader.textContent = "Affiliated Research Topics"
        topicsDiv.appendChild(topicHeader)
        topicsDiv.appendChild(topicsContentDiv)
        const researchTopics = JSON.parse(sessionStorage.getItem("researchTopics"))

        const numResearchTopics = researchTopics.length
        researchTopicsText = document.createElement("p")
        researchTopicsText.id = "research-topics-text"
        researchTopicsText.textContent = "Number of Research Topics: " + numResearchTopics
        contentSect.insertBefore(researchTopicsText, contentSect.firstChild)


        researchTopics.forEach(topic => {
            const indvTopicDiv = document.createElement("div")
            indvTopicDiv.classList.add("indv-topic-container")
            const topicHeader = document.createElement("h3")
            topicHeader.classList.add("topic-header")
            topicHeader.textContent = topic
            //terms
            const topicTermsHeader = document.createElement("h4")
            topicTermsHeader.textContent = "MeSH Terms"
            const topicTermsText = document.createElement("p")
            topicTermsText.textContent = nodeMap.get(topic).terms
            //short sum
            const topicShortSumHeader =document.createElement("h4")
            topicShortSumHeader.textContent = "Short Summary"
            const topicShortSumText = document.createElement("p")
            topicShortSumText.textContent = nodeMap.get(topic).shortsummary
            //sum
            const topicSumHeader = document.createElement("h4")
            topicSumHeader.textContent = "Summary"
            const topicSumText = document.createElement("p")
            topicSumText.textContent = nodeMap.get(topic).summary

            topicsContentDiv.appendChild(topicHeader)
            topicsContentDiv.appendChild(indvTopicDiv)
            indvTopicDiv.appendChild(topicTermsHeader)
            indvTopicDiv.appendChild(topicTermsText)
            indvTopicDiv.appendChild(topicShortSumHeader)
            indvTopicDiv.appendChild(topicShortSumText)
            indvTopicDiv.appendChild(topicSumHeader)
            indvTopicDiv.appendChild(topicSumText)

        })





    }

    if(nodeType === "Domain" || nodeType === "Method"){
        const curNode = nodeMap.get(nodeName)
        termsHeader.textContent = "MeSH terms"
        termsText.textContent = curNode.terms
        summaryHeader.textContent = "Summary"
        summaryText.textContent = curNode.summary


        var sizeRankText = document.createElement("p")
        contentSect.insertBefore(sizeRankText, contentSect.firstChild)
        sizeRankText.id = "size-rank-text"
        sizeRankText.textContent = "This domain group is ranked " + curNode.sizerank + "/30 by size"


        var sumDiv = document.getElementById("summary-container") 
        var shortSumHeader = document.createElement("h2")
        shortSumHeader.id = 'short-summary-header'
        shortSumHeader.textContent = 'Short Summary'
        var shortSumText = document.createElement("p")
        shortSumText.id = 'short-summary-text'
        shortSumText.textContent = curNode.shortsummary
        sumDiv.insertBefore(shortSumText, sumDiv.firstChild)
        sumDiv.insertBefore(shortSumHeader, sumDiv.firstChild)

    }
})
