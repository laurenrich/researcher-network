var svgDomain = d3.select("#svg-domain")
var svgMethod = d3.select("#svg-method")

var width = svgDomain.attr("width")
var height = svgDomain.attr("height")

var currentGraph = "Domain"
let domainNodeMap = new Map()
let methodNodeMap = new Map()
var currentNodeMap = domainNodeMap
var emphasizedDomainNodeIDs = [] //for domain group highlighting
var emphasizedMethodNodeIDs = [] //for method group highlighting
var emphasizedDomainNodeID = [] //for single faculty highlighting in domain graph
var emphasizedMethodNodeID = [] //for single faculty highlighting in method graph
var rectHighlightDomain = []
var rectHighlightMethod = []
var rectsHighlightDomain = []
var rectsHighlightMethod = []

var domainZoom = d3.zoom()
    .scaleExtent([0.5, 5])
    //.translateExtent([[0,0],[width*1.5, height*1.5]])
    .on("zoom", function(event){
        svgDomain.select("#graph").attr("transform", event.transform)
})

var methodZoom = d3.zoom()
    .scaleExtent([0.5, 5])
    .on("zoom", function(event){
        svgMethod.select("#graph").attr("transform", event.transform)
})

//used outside data loading funct
var domainLinks;
var methodLinks;

var domainLegendData;
var methodLegendData;

d3.json("graphdata.json").then(data => {
    const domainNodes = [...data.facultyNodes, ...data.domainNodes]
    const methodNodes = [...data.facultyNodes, ...data.methodNodes]
    const allNodes = [...data.facultyNodes, ...data.domainNodes, ...data.methodNodes]     
    domainLinks = data.domainLinks
    methodLinks = data.methodLinks


    populateDropdowns(allNodes)
    renderSimulation(svgDomain, domainNodes, domainLinks, domainZoom, domainNodeMap)    
    renderSimulation(svgMethod, methodNodes, methodLinks, methodZoom, methodNodeMap)

    domainLegendData = data.domainNodes;
    methodLegendData = data.methodNodes;
    createLegend(domainLegendData)

    var currentSvg = svgDomain
    var currentZoom = domainZoom
    var facNodeSelectionDomain;
    var facNodeSelectionMethod;
    var domainnodeSelection;
    var methodnodeSelection;
    const facultyDropdownDomain = document.getElementById("facultyDomainDropdown")
    const facultyDropdownMethod = document.getElementById("facultyMethodDropdown")
    const domDropdown = document.getElementById("domainDropdown")
    const methDropdown = document.getElementById("methodDropdown")

    function domainfacultySelected(selectedFac){
        outlineFacDropdownBorder(d3.select(facultyDropdownDomain), "yellow") 
        //reset prior fac web if exists 
        revertNodesBack(emphasizedDomainNodeID)
        revertRects(rectsHighlightDomain)
        rectsHighlightDomain = []
        resetFacLinks(svgDomain, facNodeSelectionDomain)
        //reset existing domain web if exists 
        revertNodesBack(emphasizedDomainNodeIDs)
        revertRects(rectHighlightDomain)
        resetLinks(svgDomain, domainnodeSelection)
        //clear domain dropdown and unhighlight dropdown border to show inactive 
        domDropdown.selectedIndex = 0;
        outlineFacDropdownBorder(d3.select(domDropdown), "")

        facNodeSelectionDomain = selectedFac
        const transform = d3.zoomIdentity
            .translate(width/2, height/2)
            .scale(2)
            .translate(-facNodeSelectionDomain.x, -facNodeSelectionDomain.y)
        currentSvg.transition().duration(750).call(currentZoom.transform, transform)
        console.log(d3.select(this))
        emphasizeNode(facNodeSelectionDomain.id, emphasizedDomainNodeID, "yellow")
        rectsHighlightDomain = domainLinks
                                .filter(node => node.source.id === facNodeSelectionDomain.id)
                                .map(node => node.target.id)
    
        highlightFacLinks(facNodeSelectionDomain, svgDomain) 
        emphasizeRects(rectsHighlightDomain)
    }

    function methodfacultySelected(selectedFac){
        outlineFacDropdownBorder(d3.select(facultyDropdownMethod), "yellow") 
        //reset prior fac web if exists 
        revertNodesBack(emphasizedMethodNodeID)
        revertRects(rectsHighlightMethod)
        rectsHighlightMethod = []
        resetFacLinks(svgMethod, facNodeSelectionMethod)
        //reset existing domain web if exists 
        revertNodesBack(emphasizedMethodNodeIDs)
        revertRects(rectHighlightMethod)
        resetLinks(svgMethod, methodnodeSelection)
        //clear domain dropdown and unhighlight dropdown border to show inactive 
        methDropdown.selectedIndex = 0;
        outlineFacDropdownBorder(d3.select(methDropdown), "")

        facNodeSelectionMethod = selectedFac
        const transform = d3.zoomIdentity
            .translate(width/2, height/2)
            .scale(2)
            .translate(-facNodeSelectionMethod.x, -facNodeSelectionMethod.y)
        currentSvg.transition().duration(750).call(currentZoom.transform, transform)
        console.log(d3.select(this))
        emphasizeNode(facNodeSelectionMethod.id, emphasizedMethodNodeID, "yellow")
        rectsHighlightMethod = methodLinks
                                .filter(node => node.source.id === facNodeSelectionMethod.id)
                                .map(node => node.target.id)
    
        highlightFacLinks(facNodeSelectionMethod, svgMethod) 
        emphasizeRects(rectsHighlightMethod)
    }



    svgDomain.selectAll('circle').on('click', function(event) {
        const selectionData = d3.select(this).datum()
        const name = selectionData.id
        facultyDropdownDomain.value = name
        domainfacultySelected(selectionData)
    })

    svgMethod.selectAll('circle').on('click', function(event){
        const selectionData = d3.select(this).datum()
        const name = selectionData.id
        facultyDropdownMethod.value = name
        methodfacultySelected(selectionData)
    })

 
    facultyDropdownDomain.addEventListener('change', function(event){
        const dropdownSelection = event.target.value;
        domainfacultySelected(allNodes.find(d => d.id === dropdownSelection))        
    })

    facultyDropdownMethod.addEventListener('change', function(event){
        const dropdownSelection = event.target.value;
        methodfacultySelected(allNodes.find(d => d.id === dropdownSelection))
    })


    function domainSelected(selectedDom){
        outlineFacDropdownBorder(d3.select(domDropdown), "orange")
        //unhighlight previous domain web if exists 
        revertRects(rectHighlightDomain)
        rectHighlightDomain = []
        resetLinks(svgDomain, domainnodeSelection)
        revertNodesBack(emphasizedDomainNodeIDs)
        //unhighlight previous fac web if exists 
        revertRects(rectsHighlightDomain)
        resetFacLinks(svgDomain, facNodeSelectionDomain)
        revertNodesBack(emphasizedDomainNodeID)
        //clear fac dropdown and unhighlight dropdown border to show inactive
        facultyDomainDropdown.selectedIndex = 0;
        outlineFacDropdownBorder(d3.select(facultyDomainDropdown), "")

       domainnodeSelection = selectedDom

        const transform = d3.zoomIdentity
            .translate(width/2, height/2)
            .scale(2)
            .translate(-domainnodeSelection.x, -domainnodeSelection.y)
        currentSvg.transition().duration(750).call(currentZoom.transform, transform)
        //highlights links, nodes, and domain rects for group
        highlightLinks(domainnodeSelection)
        highlightNodes(domainnodeSelection, domainLinks, emphasizedDomainNodeIDs)
        rectHighlightDomain[0] = domainnodeSelection.id
        emphasizeRects(rectHighlightDomain)
    }


    function methodSelected(selectedMeth){
        outlineFacDropdownBorder(d3.select(methDropdown), "orange")
        //unhighlight previous domain web if exists 
        revertRects(rectHighlightMethod)
        rectHighlightMethod = []
        resetLinks(svgMethod, methodnodeSelection)
        revertNodesBack(emphasizedMethodNodeIDs)
        //unhighlight previous fac web if exists 
        revertRects(rectsHighlightMethod)
        resetFacLinks(svgMethod, facNodeSelectionMethod)
        revertNodesBack(emphasizedMethodNodeID)
        //clear fac dropdown and unhighlight dropdown border to show inactive
        facultyMethodDropdown.selectedIndex = 0;
        outlineFacDropdownBorder(d3.select(facultyMethodDropdown), "")

       methodnodeSelection = selectedMeth

        const transform = d3.zoomIdentity
            .translate(width/2, height/2)
            .scale(2)
            .translate(-methodnodeSelection.x, -methodnodeSelection.y)
        currentSvg.transition().duration(750).call(currentZoom.transform, transform)
        //highlights links, nodes, and domain rects for group
        highlightLinks(methodnodeSelection)
        highlightNodes(methodnodeSelection, methodLinks, emphasizedMethodNodeIDs)
        rectHighlightMethod[0] = methodnodeSelection.id
        emphasizeRects(rectHighlightMethod)
    }



    svgDomain.selectAll('rect').on('click', function(event) {
        const selectionData = d3.select(this).datum()
        const name = selectionData.id
        domDropdown.value = name
        domainSelected(selectionData)
    })

    svgMethod.selectAll('rect').on('click', function(event) {
        const selectionData = d3.select(this).datum()
        const name = selectionData.id
        methDropdown.value = name
        methodSelected(selectionData)
    })

    domDropdown.addEventListener('change', function(event){
        const dropdownSelection = event.target.value;
        domainSelected(allNodes.find(d => d.id === dropdownSelection))
    })

    methDropdown.addEventListener('change', function(event){
        const dropdownSelection = event.target.value;
        methodSelected(allNodes.find(d => d.id === dropdownSelection))
    })


  

    document.getElementById("domain-btn").addEventListener('click', function() {
        createLegend(domainLegendData)
        currentSvg = svgDomain
        currentZoom = domainZoom
        currentNodeMap = domainNodeMap
        currentGraph = "Domain"
        document.getElementById("facultyDomainDropdown").classList.remove("hidden")
        document.getElementById("facultyMethodDropdown").classList.add("hidden")
        document.getElementById("domainDropdown").classList.remove("hidden")
        document.getElementById("methodDropdown").classList.add("hidden")
        document.getElementById("svg-domain").classList.remove("hidden")
        document.getElementById("svg-method").classList.add("hidden")
        toggleBtnColor("domain-btn", "method-btn")
        
    })
    
    document.getElementById("method-btn").addEventListener('click', function() {
        createLegend(methodLegendData)
        currentSvg = svgMethod
        currentZoom = methodZoom
        currentNodeMap = methodNodeMap
        currentGraph = "Method"
        document.getElementById("facultyDomainDropdown").classList.add("hidden")
        document.getElementById("facultyMethodDropdown").classList.remove("hidden")
        document.getElementById("domainDropdown").classList.add("hidden")
        document.getElementById("methodDropdown").classList.remove("hidden")
        document.getElementById("svg-domain").classList.add("hidden")
        document.getElementById("svg-method").classList.remove("hidden")
        toggleBtnColor("method-btn", "domain-btn")
    
    })
})


function highlightNodes(node, links, nodeArray) {
    links.forEach(link => {
        if(link.target.id === node.id){
            emphasizeNode(link.source.id, nodeArray, "orange")
        }
        })
}


function highlightLinks(node){
    d3.selectAll("line")
        .filter(d => d.target.id === node.id)
        .attr("stroke", "orange")
        .attr("stroke-width", 3)
}

//node is faculty node,, circle
function resetFacLinks(svg, node){
    if(node){
        svg.selectAll("line")
            .filter(d => d.source.id === node.id)
            .attr("stroke", "#999")
            .attr("stroke-width", 1.5)
    }
}

//node is group node,, rect
function resetLinks(svg, node) {
    if(node){
        svg.selectAll("line")
            .filter(d => d.target.id === node.id)
            .attr("stroke","#999")
            .attr("stroke-width", 1.5)
    }
}


function highlightFacLinks(node, svg){
    svg.selectAll("line")
        .filter(d => d.source.id === node.id)
        .attr("stroke", "orange")
        .attr("stroke-width", 4)
}

function emphasizeRects(squareNodeIDs){
    if(squareNodeIDs){
        let fillColor;
        squareNodeIDs.forEach(squareNodeID => {
            const node = currentNodeMap.get(squareNodeID)
            fillColor = node.select("rect").attr("fill")

            node.select("rect")
                .transition()
                .duration(750)
                .attr("stroke", "orange")
                .attr("stroke-width", 2)
                .attr("fill", fillColor)
                .attr("width", 15)
                .attr("height", 15)
            })
    }
}

function revertRects(squareNodeIDs){
    if(squareNodeIDs){
        let fillColor;
        squareNodeIDs.forEach(squareNodeID => {
            const node = currentNodeMap.get(squareNodeID)
            fillColor = node.select("rect").attr("fill")

            node.select("rect")
                .transition()
                .duration(750)
                .attr("stroke", "white")
                .attr("stroke-width", 1)
                .attr("fill", fillColor)
                .attr("width", 10)
                .attr("height", 10)
            })
    }
}



function emphasizeNode(nodeID, nodeArray, color){
    const node = currentNodeMap.get(nodeID)
       
    node.select("circle")
        .transition()
        .duration(750)
        .attr("r", 7)
        .attr("stroke", color)
        .attr("stroke-width", 3)
        .attr("fill",  "rgb(0, 0, 255)")

    nodeArray.push(nodeID)
}       

function revertNodesBack(nodes){
    nodes.forEach(node => {
        node = currentNodeMap.get(node)
        node.select("circle")
        .transition()
        .duration(750)
        .attr("r", 5)
        .attr("stroke","#fff")
        .attr("stroke-width", 1)
        .attr("fill",  "rgba(0, 0, 255, 0.2)")
    })

    nodes.length = 0

}

//to outline dropdown
function outlineFacDropdownBorder(selection, color){
    const value = selection.property("value")
    if(value !== "default"){
        selection
            .style("border", `5px solid ${color}`)
            .style("transition", "border-color 1.0s ease")
    }else{
        selection
            .style("border", "1px solid black")
    }
}


function populateDropdowns(nodes){
    const facultyDomainDropdown = d3.select("#facultyDomainDropdown")
    const facultyMethodDropdown = d3.select("#facultyMethodDropdown")
    const domaindropdown = d3.select("#domainDropdown") 
    const methoddropdown = d3.select("#methodDropdown")
    nodes.forEach(node => {
            if(node.type === "Faculty"){
                facultyDomainDropdown.append("option")
                .attr("value", node.id)
                .text(node.id)
                facultyMethodDropdown.append("option")
                .attr("value", node.id)
                .text(node.id)
            }else if(node.type === "Domain"){
                domaindropdown.append("option")
                .attr("value", node.id)
                .text(node.id)
            }else if(node.type === "Method"){
                methoddropdown.append("option")
                .attr("value", node.id)
                .text(node.id) 
            }
        })
     
}



function renderSimulation(svg, nodes, links, zoom, nodeMap){

    const graph = svg.append("g")
        .attr("id", "graph")

    var link = graph
        .append("g")
        .attr("stroke","#999")
        .attr("stroke-opacity", 0.6)
        .selectAll()
        .data(links)
        .enter()
        .append("line")

    var node = graph
        .append("g")
        .attr("stroke","#fff")
        .attr("stroke-opacity", 1.5)
        .selectAll()
        .data(nodes)
        .enter()
        .append("g")
        .each(function(d) {
            nodeShape(d3.select(this), d)
            createText(d3.select(this))
        })
        .attr("id", d => d.id)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover", function(event, d){
            d3.select(this).raise()
            d3.select(this).select("text").text(d.id)
        })  
        .on("mouseout", function(event, d){
            d3.select(this).select("text").text("")
        })
        .on("dblclick", function(event, d){
            sessionStorage.setItem("nodeName", d.id)
            sessionStorage.setItem("currentGraph", currentGraph)
            sessionStorage.setItem("nodeType", d.type)
            var facToNodes = []
            if(currentGraph === "Domain"){
                domainLinks.forEach(link => {
                    if(d.id === link.source.id){
                        facToNodes.push(link.target.id)
                    }
                })
            }else{
                methodLinks.forEach(link => {
                    if(d.id === link.source.id){
                        facToNodes.push(link.target.id)
                    }
                })
            }
            sessionStorage.setItem("researchTopics", JSON.stringify(facToNodes))
            window.location.href = 'node.html'
        })

    
        
    //creates a mapping of node id -> d3 node element for easy lookup
    node.each(function(d) {
        nodeMap.set(d.id, d3.select(this))
    })
    

    svg.call(zoom)
            
    
    var simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink().id(d => d.id).links(links))
        .force("charge", d3.forceManyBody().strength(-20))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
        });

        function dragstarted(event) {
            if(!event.active) simulation.alphaTarget(0.05).restart()
            event.subject.fx = event.subject.x
            event.subject.fy = event.subject.y
        }
    
        function dragged(event) {
            event.subject.fx = event.x
            event.subject.fy = event.y
        }
    
        function dragended(event) {
            if(!event.active) simulation.alphaTarget(0)
            event.subject.fx = null
            event.subject.fy = null
        }  

}
    var domaincolorIdx = 0;
    var methodcolorIdx = 0;
    colors = [
            "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", 
            "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#393b79", "#5254a3",
            "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c", 
            "#E7F10F", "#bd9e39", "#e7ba52", "#e7969c", "#c7c7c7", "#8c564b", 
            "#d6616b", "#e7cb94", "#ff9896", "#c5b0d5", "#9edae5", "#F0B8E0"
        ];
    function nodeShape(network, d){
        if(d.type === "Faculty"){
            network.append("circle")
                .attr("r", 5)
                .attr("fill",  "rgba(0, 0, 255, 0.2)")
        }else if(d.type === "Domain"){
            network.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", colors[domaincolorIdx])
        domaincolorIdx = domaincolorIdx + 1
        }else if(d.type === "Method"){
            network.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", colors[methodcolorIdx])
        methodcolorIdx = methodcolorIdx + 1
        }
    }

    function createText(node){    
        node.append("text")
            .attr("dx", 10)
            .attr("dy", -10)
            .attr("font-size", "10px")
            .attr("fill", "black")
            .attr("font-weight", 900)
            .attr("stroke", "white")
            .attr("stroke-width", 0.5)
            .text("")
    }

    function toggleBtnColor(btnClickedId, btnUnclickedId) {
        const btnUnclicked = document.getElementById(btnUnclickedId)
        const btnClicked = document.getElementById(btnClickedId)
        btnUnclicked.classList.remove('active')
        btnClicked.classList.remove('unactive')
        btnUnclicked.classList.add('unactive')
        btnClicked.classList.add('active')
    }

    function createLegend(legendData){
        const legend = document.getElementById("legend-list");
        legend.innerHTML = '';
        const facli = document.createElement("li")
        const facspan = document.createElement("span")
        facspan.classList.add('circle')
        facli.appendChild(facspan)
        facli.appendChild(document.createTextNode("Faculty"))
        legend.appendChild(facli)
         
        legendData.forEach((node, idx) =>{
            const li = document.createElement("li")
            const span = document.createElement("span")
            span.classList.add("rect")
            span.style.backgroundColor = colors[idx];
            li.appendChild(span)
            li.appendChild(document.createTextNode(node.id))
            legend.appendChild(li)
        })
    }





