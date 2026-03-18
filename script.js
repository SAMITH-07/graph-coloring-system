// Graph Coloring Application for Exam Scheduling
class GraphColoringApp {
    constructor() {
        this.courses = [];
        this.conflicts = [];
        this.adjacencyList = {};
        this.colors = {};
        this.colorMap = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#FFD93D', '#6BCB77', '#FF6B9D',
            '#C44569', '#F8B195', '#F67280', '#355C7D', '#6C5CE7'
        ];
        this.initializeApp();
    }

    initializeApp() {
        this.updateStatistics();
        this.updateConflictDropdowns();
    }

    // Course Management
    addCourse(courseName) {
        if (!courseName || this.courses.includes(courseName)) {
            return false;
        }
        this.courses.push(courseName);
        this.adjacencyList[courseName] = [];
        this.updateCourseList();
        this.updateConflictDropdowns();
        this.updateStatistics();
        return true;
    }

    removeCourse(courseName) {
        const index = this.courses.indexOf(courseName);
        if (index > -1) {
            this.courses.splice(index, 1);
            delete this.adjacencyList[courseName];
            
            // Remove conflicts involving this course
            this.conflicts = this.conflicts.filter(conflict => 
                conflict[0] !== courseName && conflict[1] !== courseName
            );
            
            // Remove from adjacency lists
            Object.keys(this.adjacencyList).forEach(course => {
                this.adjacencyList[course] = this.adjacencyList[course].filter(
                    neighbor => neighbor !== courseName
                );
            });
            
            this.updateCourseList();
            this.updateConflictList();
            this.updateConflictDropdowns();
            this.updateStatistics();
            this.visualizeGraph();
        }
    }

    // Conflict Management
    addConflict(course1, course2) {
        if (!course1 || !course2 || course1 === course2) {
            return false;
        }
        
        const conflict = [course1, course2].sort();
        const exists = this.conflicts.some(c => 
            (c[0] === conflict[0] && c[1] === conflict[1])
        );
        
        if (!exists) {
            this.conflicts.push(conflict);
            this.adjacencyList[course1].push(course2);
            this.adjacencyList[course2].push(course1);
            this.updateConflictList();
            this.updateStatistics();
            this.visualizeGraph();
            return true;
        }
        return false;
    }

    // Greedy Graph Coloring Algorithm
    greedyColoring() {
        // Reset colors
        this.colors = {};
        
        // Order vertices by degree (descending)
        const vertices = Object.keys(this.adjacencyList).sort((a, b) => {
            return this.adjacencyList[b].length - this.adjacencyList[a].length;
        });
        
        // Assign colors
        vertices.forEach(vertex => {
            const usedColors = new Set();
            
            // Check neighbors' colors
            this.adjacencyList[vertex].forEach(neighbor => {
                if (this.colors[neighbor] !== undefined) {
                    usedColors.add(this.colors[neighbor]);
                }
            });
            
            // Assign smallest available color
            let color = 0;
            while (usedColors.has(color)) {
                color++;
            }
            this.colors[vertex] = color;
        });
        
        return this.colors;
    }

    // Visualization
    visualizeGraph() {
        console.log('VisualizeGraph called', {
            courses: this.courses,
            conflicts: this.conflicts,
            colors: this.colors,
            adjacencyList: this.adjacencyList
        });

        const container = document.getElementById('graphContainer');
        if (!container) {
            console.error('Graph container not found!');
            return;
        }

        container.innerHTML = '';
        
        if (this.courses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-network"></i>
                    <p>Graph will appear here after adding courses and conflicts</p>
                </div>
            `;
            return;
        }

        const width = container.clientWidth || 800;
        const height = 400;

        console.log('Creating graph with dimensions:', { width, height });

        // Clear any existing SVG
        d3.select('#graphContainer').selectAll('*').remove();

        // Create SVG with proper namespace
        const svg = d3.select('#graphContainer')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('background', '#0f172a');

        console.log('SVG created:', svg.node());

        // Prepare data
        const nodeData = this.courses.map(course => ({
            id: course,
            color: this.colors[course] !== undefined ? this.colorMap[this.colors[course]] : '#475569'
        }));

        const linkData = this.conflicts.map(conflict => ({
            source: conflict[0],
            target: conflict[1]
        }));

        console.log('Data prepared:', { nodeData, linkData });

        // Create force simulation
        const simulation = d3.forceSimulation(nodeData)
            .force('link', d3.forceLink(linkData).id(d => d.id).distance(120))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(30));

        console.log('Force simulation created');

        // Create links
        const link = svg.append('g')
            .selectAll('line')
            .data(linkData)
            .enter().append('line')
            .attr('class', 'link')
            .style('stroke-width', 2);

        console.log('Links created:', link.size());

        // Create nodes
        const node = svg.append('g')
            .selectAll('circle')
            .data(simulation.nodes())
            .enter().append('circle')
            .attr('class', 'node')
            .attr('r', 25)
            .attr('fill', d => d.color)
            .attr('stroke', '#1e293b')
            .attr('stroke-width', 3)
            .on('click', function(event, d) {
                const degree = app.adjacencyList[d.id].length;
                const neighbors = app.adjacencyList[d.id].join(', ');
                alert(`Vertex: ${d.id}\nDegree: ${degree}\nConnected to: ${neighbors}\nColor: ${app.getColorName(app.colors[d.id])}`);
            })
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        console.log('Nodes created:', node.size());

        // Add labels
        const label = svg.append('g')
            .selectAll('text')
            .data(simulation.nodes())
            .enter().append('text')
            .text(d => d.id)
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .attr('font-weight', 'bold')
            .attr('font-size', '14px')
            .attr('fill', 'white')
            .attr('pointer-events', 'none')
            .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)');

        console.log('Labels created:', label.size());

        // Update positions on tick
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => Math.max(30, Math.min(width - 30, d.x)))
                .attr('cy', d => Math.max(30, Math.min(height - 30, d.y)));

            label
                .attr('x', d => Math.max(30, Math.min(width - 30, d.x)))
                .attr('y', d => Math.max(30, Math.min(height - 30, d.y)));
        });

        console.log('Graph visualization complete');

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }

    // Generate Exam Schedule
    generateExamSchedule() {
        const schedule = {};
        const maxColor = Math.max(...Object.values(this.colors), -1);
        
        for (let i = 0; i <= maxColor; i++) {
            schedule[i] = [];
        }
        
        Object.keys(this.colors).forEach(course => {
            const color = this.colors[course];
            schedule[color].push(course);
        });
        
        return schedule;
    }

    // UI Update Methods
    updateCourseList() {
        const container = document.getElementById('courseList');
        if (this.courses.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No courses added yet</p></div>';
            return;
        }
        
        container.innerHTML = this.courses.map(course => `
            <div class="course-tag">
                ${course}
                <button onclick="app.removeCourse('${course}')" title="Remove course">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    updateConflictList() {
        const container = document.getElementById('conflictList');
        if (this.conflicts.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No conflicts added yet</p></div>';
            return;
        }
        
        container.innerHTML = this.conflicts.map((conflict, index) => `
            <div class="conflict-item">
                <span>
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    ${conflict[0]} ↔ ${conflict[1]}
                </span>
                <button onclick="app.removeConflict(${index})" class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    removeConflict(index) {
        const conflict = this.conflicts[index];
        if (conflict) {
            // Remove from adjacency list
            this.adjacencyList[conflict[0]] = this.adjacencyList[conflict[0]].filter(
                neighbor => neighbor !== conflict[1]
            );
            this.adjacencyList[conflict[1]] = this.adjacencyList[conflict[1]].filter(
                neighbor => neighbor !== conflict[0]
            );
            
            // Remove from conflicts array
            this.conflicts.splice(index, 1);
            
            this.updateConflictList();
            this.updateStatistics();
            this.visualizeGraph();
        }
    }

    updateConflictDropdowns() {
        const select1 = document.getElementById('conflict1');
        const select2 = document.getElementById('conflict2');
        
        const options = '<option value="">Select Course</option>' + 
            this.courses.map(course => `<option value="${course}">${course}</option>`).join('');
        
        select1.innerHTML = options;
        select2.innerHTML = options;
    }

    updateStatistics() {
        document.getElementById('courseCount').textContent = this.courses.length;
        document.getElementById('conflictCount').textContent = this.conflicts.length;
        document.getElementById('colorCount').textContent = Object.keys(this.colors).length > 0 ? 
            Math.max(...Object.values(this.colors)) + 1 : 0;
        document.getElementById('slotCount').textContent = Object.keys(this.colors).length > 0 ? 
            Math.max(...Object.values(this.colors)) + 1 : 0;
    }

    updateColorLegend() {
        const container = document.getElementById('colorLegend');
        const usedColors = new Set(Object.values(this.colors));
        
        if (usedColors.size === 0) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = '<h3 style="margin-bottom: 12px; color: #333;">Color Legend:</h3>' +
            Array.from(usedColors).sort().map(color => `
                <div class="color-legend">
                    <div class="color-box" style="background-color: ${this.colorMap[color]}"></div>
                    <span>Time Slot ${color + 1}</span>
                </div>
            `).join('');
    }

    updateExamSchedule() {
        const container = document.getElementById('examSchedule');
        const schedule = this.generateExamSchedule();
        const timeSlots = Object.keys(schedule);
        
        if (timeSlots.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>Schedule will appear after running the algorithm</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = timeSlots.map(slot => `
            <div class="schedule-slot">
                <h3>
                    <i class="fas fa-clock"></i>
                    Time Slot ${parseInt(slot) + 1}
                </h3>
                <div class="schedule-courses">
                    ${schedule[slot].map(course => `
                        <div class="schedule-course">${course}</div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // Live Demo Function
    async runLiveDemo() {
        this.clearAll();
        this.addObservation('🚀 Starting Live Demo - Graph Coloring Visualization');
        
        // Step 1: Add courses
        this.addObservation('📚 Step 1: Adding courses to system');
        const courses = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'];
        
        for (let course of courses) {
            this.addCourse(course);
            this.addObservation(`✅ Added course: ${course}`);
            await this.delay(500);
        }
        
        // Step 2: Add conflicts
        this.addObservation('⚠️ Step 2: Adding conflict relationships');
        const conflicts = [
            ['C1', 'C2'], ['C1', 'C3'], ['C2', 'C3'], ['C2', 'C4'], 
            ['C3', 'C5'], ['C4', 'C5'], ['C4', 'C6'], ['C5', 'C7'], ['C6', 'C7']
        ];
        
        for (let conflict of conflicts) {
            this.addConflict(conflict[0], conflict[1]);
            this.addObservation(`🔗 Added conflict: ${conflict[0]} ↔ ${conflict[1]}`);
            await this.delay(500);
        }
        
        // Step 3: Calculate degrees
        this.addObservation('📊 Step 3: Calculating vertex degrees');
        const degrees = {};
        
        for (const course of Object.keys(this.adjacencyList)) {
            degrees[course] = this.adjacencyList[course].length;
            this.addObservation(`📈 ${course}: Degree = ${degrees[course]}`);
            await this.delay(300);
        }
        
        // Step 4: Order vertices by degree
        this.addObservation('🔄 Step 4: Ordering vertices by degree (descending)');
        const sortedVertices = Object.keys(degrees).sort((a, b) => degrees[b] - degrees[a]);
        this.addObservation(`📋 Vertex order: ${sortedVertices.join(', ')}`);
        await this.delay(1000);
        
        // Step 5: Run coloring algorithm
        this.addObservation('🎨 Step 5: Applying Greedy Coloring Algorithm');
        this.greedyColoring();
        
        for (let vertex of sortedVertices) {
            const color = this.colors[vertex];
            const colorName = this.getColorName(color);
            this.addObservation(`🎯 ${vertex} assigned ${colorName}`);
            await this.delay(500);
        }
        
        // Step 6: Display results
        this.visualizeGraph();
        this.updateColorLegend();
        this.updateExamSchedule();
        this.updateStatistics();
        
        this.addObservation('✨ Step 6: Visualization complete');
        this.addObservation(`📈 Total colors used: ${Math.max(...Object.values(this.colors)) + 1}`);
        this.addObservation('🎉 Live Demo completed successfully!');
    }

    // Step-by-Step Coloring
    async stepByStepColoring() {
        if (this.courses.length === 0) {
            alert('Please add courses and conflicts first!');
            return;
        }

        this.addObservation('🎯 Starting Step-by-Step Coloring');
        this.colors = {};
        
        // Order vertices by degree
        const vertices = Object.keys(this.adjacencyList).sort((a, b) => {
            return this.adjacencyList[b].length - this.adjacencyList[a].length;
        });
        
        this.addObservation(`📋 Vertex order: ${vertices.join(', ')}`);
        
        for (let i = 0; i < vertices.length; i++) {
            const vertex = vertices[i];
            this.addObservation(`\n🎨 Processing ${vertex} (Step ${i + 1}/${vertices.length})`);
            
            // Find available colors
            const usedColors = new Set();
            this.adjacencyList[vertex].forEach(neighbor => {
                if (this.colors[neighbor] !== undefined) {
                    usedColors.add(this.colors[neighbor]);
                }
            });
            
            // Assign smallest available color
            let color = 0;
            while (usedColors.has(color)) {
                color++;
            }
            
            this.colors[vertex] = color;
            const colorName = this.getColorName(color);
            this.addObservation(`✅ ${vertex} assigned ${colorName}`);
            
            // Update visualization
            this.visualizeGraph();
            this.updateColorLegend();
            await this.delay(1000);
        }
        
        this.updateExamSchedule();
        this.updateStatistics();
        this.addObservation('\n🎉 Step-by-step coloring completed!');
    }

    // Compare Algorithms
    compareAlgorithms() {
        if (this.courses.length === 0) {
            alert('Please add courses and conflicts first!');
            return;
        }

        const container = document.getElementById('algorithmComparison');
        container.innerHTML = '';

        // Store original colors
        const originalColors = {...this.colors};
        
        // Test Greedy Algorithm
        const greedyStart = performance.now();
        this.greedyColoring();
        const greedyEnd = performance.now();
        const greedyColors = {...this.colors};
        const greedyTime = (greedyEnd - greedyStart).toFixed(2);
        const greedyColorsUsed = Math.max(...Object.values(this.colors)) + 1;

        // Test Welsh-Powell Algorithm
        this.colors = {};
        const welshStart = performance.now();
        this.welshPowellColoring();
        const welshEnd = performance.now();
        const welshColors = {...this.colors};
        const welshTime = (welshEnd - welshStart).toFixed(2);
        const welshColorsUsed = Math.max(...Object.values(this.colors)) + 1;

        // Display comparison
        container.innerHTML = `
            <div class="comparison-table">
                <h3>Algorithm Performance Comparison</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #1e40af;">
                            <th style="padding: 12px; text-align: left; color: white;">Algorithm</th>
                            <th style="padding: 12px; text-align: center; color: white;">Colors Used</th>
                            <th style="padding: 12px; text-align: center; color: white;">Time (ms)</th>
                            <th style="padding: 12px; text-align: center; color: white;">Efficiency</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #334155;">
                            <td style="padding: 12px; font-weight: 600;">Greedy</td>
                            <td style="padding: 12px; text-align: center; color: #3b82f6;">${greedyColorsUsed}</td>
                            <td style="padding: 12px; text-align: center;">${greedyTime}</td>
                            <td style="padding: 12px; text-align: center; color: #10b981;">${((this.courses.length / greedyColorsUsed) * 100).toFixed(1)}%</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #334155;">
                            <td style="padding: 12px; font-weight: 600;">Welsh-Powell</td>
                            <td style="padding: 12px; text-align: center; color: #8b5cf6;">${welshColorsUsed}</td>
                            <td style="padding: 12px; text-align: center;">${welshTime}</td>
                            <td style="padding: 12px; text-align: center; color: #10b981;">${((this.courses.length / welshColorsUsed) * 100).toFixed(1)}%</td>
                        </tr>
                    </tbody>
                </table>
                <div style="margin-top: 16px;">
                    <h4>Winner: ${greedyColorsUsed <= welshColorsUsed ? 'Greedy Algorithm' : 'Welsh-Powell Algorithm'}</h4>
                    <p>Best performance: ${Math.min(greedyColorsUsed, welshColorsUsed)} colors</p>
                </div>
            </div>
        `;

        // Use best result
        if (greedyColorsUsed <= welshColorsUsed) {
            this.colors = greedyColors;
        } else {
            this.colors = welshColors;
        }
        
        this.visualizeGraph();
        this.updateColorLegend();
        this.updateExamSchedule();
        this.updateStatistics();
    }

    // Welsh-Powell Algorithm
    welshPowellColoring() {
        const vertices = Object.keys(this.adjacencyList);
        const degrees = {};
        
        vertices.forEach(v => {
            degrees[v] = this.adjacencyList[v].length;
        });
        
        // Sort by degree (descending)
        const sortedVertices = vertices.sort((a, b) => degrees[b] - degrees[a]);
        
        // Color assignment
        sortedVertices.forEach(vertex => {
            const usedColors = new Set();
            this.adjacencyList[vertex].forEach(neighbor => {
                if (this.colors[neighbor] !== undefined) {
                    usedColors.add(this.colors[neighbor]);
                }
            });
            
            let color = 0;
            while (usedColors.has(color)) {
                color++;
            }
            
            this.colors[vertex] = color;
        });
    }

    // Show Algorithm Analysis
    showAlgorithmAnalysis() {
        const container = document.getElementById('performanceMetrics');
        
        if (this.courses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-stopwatch"></i>
                    <p>Please create a graph first</p>
                </div>
            `;
            return;
        }

        const startTime = performance.now();
        this.greedyColoring();
        const endTime = performance.now();
        const executionTime = (endTime - startTime).toFixed(2);
        
        const maxDegree = Math.max(...Object.keys(this.adjacencyList).map(v => this.adjacencyList[v].length));
        const avgDegree = (Object.keys(this.adjacencyList).reduce((sum, v) => sum + this.adjacencyList[v].length, 0) / this.courses.length).toFixed(2);
        const colorsUsed = Math.max(...Object.values(this.colors)) + 1;
        const chromaticNumber = this.estimateChromaticNumber();
        
        container.innerHTML = `
            <div class="analysis-content">
                <h3>Performance Analysis</h3>
                <div class="metrics-grid">
                    <div class="metric-item">
                        <span class="metric-label">Execution Time:</span>
                        <span class="metric-value">${executionTime} ms</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Colors Used:</span>
                        <span class="metric-value">${colorsUsed}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Max Degree:</span>
                        <span class="metric-value">${maxDegree}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Avg Degree:</span>
                        <span class="metric-value">${avgDegree}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Graph Density:</span>
                        <span class="metric-value">${((2 * this.conflicts.length) / (this.courses.length * (this.courses.length - 1)) * 100).toFixed(2)}%</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Est. Chromatic Number:</span>
                        <span class="metric-value">≥ ${chromaticNumber}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Algorithm Efficiency:</span>
                        <span class="metric-value">${((this.courses.length / colorsUsed) * 100).toFixed(1)}%</span>
                    </div>
                </div>
                
                <h3>Complexity Analysis</h3>
                <div class="complexity-info">
                    <div class="complexity-item">
                        <strong>Time Complexity:</strong> O(V² + E)
                    </div>
                    <div class="complexity-item">
                        <strong>Space Complexity:</strong> O(V + E)
                    </div>
                    <div class="complexity-item">
                        <strong>Approximation Ratio:</strong> ≤ Δ + 1
                    </div>
                </div>
            </div>
        `;
        
        this.updateGraphProperties();
    }

    // Estimate Chromatic Number
    estimateChromaticNumber() {
        const maxDegree = Math.max(...Object.keys(this.adjacencyList).map(v => this.adjacencyList[v].length));
        const maxCliqueSize = this.findMaxCliqueSize();
        return Math.max(maxDegree + 1, maxCliqueSize);
    }

    // Find Maximum Clique Size
    findMaxCliqueSize() {
        // Simple heuristic: find largest complete subgraph
        let maxClique = 1;
        for (let i = 0; i < this.courses.length; i++) {
            const course = this.courses[i];
            const neighbors = this.adjacencyList[course];
            let cliqueSize = 1;
            
            for (let j = 0; j < neighbors.length; j++) {
                const neighbor1 = neighbors[j];
                let isComplete = true;
                
                for (let k = j + 1; k < neighbors.length; k++) {
                    const neighbor2 = neighbors[k];
                    if (!this.adjacencyList[neighbor1].includes(neighbor2)) {
                        isComplete = false;
                        break;
                    }
                }
                
                if (isComplete) {
                    cliqueSize++;
                }
            }
            
            maxClique = Math.max(maxClique, cliqueSize);
        }
        
        return maxClique;
    }

    // Update Graph Properties
    updateGraphProperties() {
        const container = document.getElementById('graphProperties');
        
        if (this.courses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-project-diagram"></i>
                    <p>No graph created yet</p>
                </div>
            `;
            return;
        }

        const isConnected = this.isGraphConnected();
        const hasCycles = this.hasCycles();
        const graphType = this.getGraphType();
        
        container.innerHTML = `
            <div class="properties-content">
                <h3>Graph Properties</h3>
                <div class="properties-grid">
                    <div class="property-item">
                        <span class="property-label">Vertices:</span>
                        <span class="property-value">${this.courses.length}</span>
                    </div>
                    <div class="property-item">
                        <span class="property-label">Edges:</span>
                        <span class="property-value">${this.conflicts.length}</span>
                    </div>
                    <div class="property-item">
                        <span class="property-label">Connected:</span>
                        <span class="property-value ${isConnected ? 'connected' : 'disconnected'}">${isConnected ? 'Yes' : 'No'}</span>
                    </div>
                    <div class="property-item">
                        <span class="property-label">Has Cycles:</span>
                        <span class="property-value">${hasCycles ? 'Yes' : 'No'}</span>
                    </div>
                    <div class="property-item">
                        <span class="property-label">Graph Type:</span>
                        <span class="property-value">${graphType}</span>
                    </div>
                    <div class="property-item">
                        <span class="property-label">Planar:</span>
                        <span class="property-value">${this.isPlanar() ? 'Yes' : 'No'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Check if graph is connected
    isGraphConnected() {
        if (this.courses.length === 0) return false;
        
        const visited = new Set();
        const queue = [this.courses[0]];
        visited.add(this.courses[0]);
        
        while (queue.length > 0) {
            const current = queue.shift();
            this.adjacencyList[current].forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            });
        }
        
        return visited.size === this.courses.length;
    }

    // Check if graph has cycles
    hasCycles() {
        const visited = new Set();
        const recursionStack = new Set();
        
        for (const course of this.courses) {
            if (this.hasCycleUtil(course, visited, recursionStack)) {
                return true;
            }
        }
        
        return false;
    }

    hasCycleUtil(course, visited, recursionStack) {
        visited.add(course);
        recursionStack.add(course);
        
        for (const neighbor of this.adjacencyList[course]) {
            if (!visited.has(neighbor)) {
                if (this.hasCycleUtil(neighbor, visited, recursionStack)) {
                    return true;
                }
            } else if (recursionStack.has(neighbor)) {
                return true;
            }
        }
        
        recursionStack.delete(course);
        return false;
    }

    // Get graph type
    getGraphType() {
        const degrees = Object.keys(this.adjacencyList).map(v => this.adjacencyList[v].length);
        const uniqueDegrees = [...new Set(degrees)];
        
        if (uniqueDegrees.length === 1) {
            return degrees[0] === this.courses.length - 1 ? 'Complete' : 'Regular';
        }
        
        if (uniqueDegrees.length === 2 && uniqueDegrees.includes(1)) {
            return 'Path';
        }
        
        return 'General';
    }

    // Check if graph is planar
    isPlanar() {
        // Simple heuristic: if edges > 3V - 6, likely non-planar
        return this.conflicts.length <= (3 * this.courses.length - 6);
    }
        getColorName(colorIndex) {
        const colorNames = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Cyan', 'Magenta', 'Lime'];
        return colorNames[colorIndex] || `Color ${colorIndex + 1}`;
    }

    addObservation(message) {
        const container = document.getElementById('demoObservations');
        const timestamp = new Date().toLocaleTimeString();
        const observation = document.createElement('div');
        observation.className = 'observation-item';
        observation.innerHTML = `
            <div class="observation-time">${timestamp}</div>
            <div class="observation-message">${message}</div>
        `;
        
        if (container.querySelector('.empty-state')) {
            container.innerHTML = '';
        }
        
        container.appendChild(observation);
        container.scrollTop = container.scrollHeight;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Generate Report
    generateReport() {
        const report = this.generateDetailedReport();
        const blob = new Blob([report], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `graph-coloring-report-${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateDetailedReport() {
        const timestamp = new Date().toLocaleString();
        const schedule = this.generateExamSchedule();
        const maxColor = Math.max(...Object.values(this.colors), -1);
        
        return `# Graph Coloring Algorithm Report
Generated by: D.Samith Raj (Reg No: 896, CSE 4th Year)
Date: ${timestamp}

## Problem Statement
Exam scheduling using graph coloring algorithm to minimize time slots while avoiding conflicts.

## Input Data

### Courses
${this.courses.map(course => `- ${course}`).join('\n')}

### Conflicts
${this.conflicts.map(conflict => `- ${conflict[0]} ↔ ${conflict[1]}`).join('\n')}

## Graph Analysis

### Vertex Degrees
${Object.keys(this.adjacencyList).map(course => 
    `- ${course}: Degree ${this.adjacencyList[course].length} (Connected to: ${this.adjacencyList[course].join(', ')})`
).join('\n')}

### Algorithm Steps
1. **Vertex Ordering**: Vertices ordered by degree in descending order
2. **Color Assignment**: Greedy algorithm assigns smallest available color
3. **Conflict Resolution**: Ensures no adjacent vertices share same color

## Results

### Color Assignment
${Object.keys(this.colors).sort().map(course => 
    `- ${course}: ${this.getColorName(this.colors[course])} (Color ${this.colors[course] + 1})`
).join('\n')}

### Statistics
- **Total Courses**: ${this.courses.length}
- **Total Conflicts**: ${this.conflicts.length}
- **Colors Used**: ${maxColor + 1}
- **Time Slots Required**: ${maxColor + 1}
- **Algorithm Efficiency**: ${((this.courses.length / (maxColor + 1)) * 100).toFixed(1)}%

### Exam Schedule
${Object.keys(schedule).sort().map(slot => `
#### Time Slot ${parseInt(slot) + 1}
${schedule[slot].map(course => `- ${course}`).join('\n')}
`).join('\n')}

## Algorithm Analysis

### Complexity Analysis
- **Time Complexity**: O(V² + E) where V = vertices, E = edges
- **Space Complexity**: O(V + E) for adjacency list and color storage
- **Approximation Ratio**: At most Δ+1 colors, where Δ is maximum vertex degree

### Quality Assessment
- **Optimality**: Greedy algorithm provides valid coloring but not always optimal
- **Performance**: Efficient for large graphs compared to exact algorithms
- **Practicality**: Suitable for real-world scheduling problems

## Observations
1. The greedy algorithm successfully colored the graph using ${maxColor + 1} colors
2. No adjacent vertices share the same color (proper coloring)
3. The algorithm runs in polynomial time, making it suitable for practical applications
4. Color assignments represent time slots in the exam schedule

## Conclusion
The graph coloring approach effectively solves the exam scheduling problem by:
- Minimizing the number of time slots
- Ensuring no student has conflicting exams
- Providing a scalable solution for larger course sets

---
*Report generated by Graph Coloring System*
*Algorithm: Greedy Graph Coloring Approximation*
*Author: D.Samith Raj, CSE 4th Year, Reg No: 896*
`;
    }
    loadProblem01() {
        console.log('loadProblem01 called');
        this.clearAll();
        // Example for Problem 01 - General Graph Coloring
        const exampleCourses = ['A', 'B', 'C', 'D', 'E', 'F'];
        const exampleConflicts = [
            ['A', 'B'], ['A', 'C'], ['B', 'C'], ['B', 'D'], 
            ['C', 'E'], ['D', 'E'], ['D', 'F'], ['E', 'F']
        ];
        
        console.log('Loading Problem 01 with courses:', exampleCourses);
        console.log('Loading Problem 01 with conflicts:', exampleConflicts);
        
        exampleCourses.forEach(course => this.addCourse(course));
        exampleConflicts.forEach(conflict => this.addConflict(conflict[0], conflict[1]));
        
        // Force visualization update
        setTimeout(() => {
            console.log('Forcing visualization update');
            this.visualizeGraph();
            this.updateColorLegend();
            this.updateExamSchedule();
            this.updateStatistics();
        }, 500);
        
        console.log('Problem 01 loaded successfully');
    }

    loadProblem02() {
        console.log('loadProblem02 called');
        this.clearAll();
        // Problem 02 - Exam Scheduling
        const courses = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'];
        const conflicts = [
            ['C1', 'C2'], ['C1', 'C3'], ['C2', 'C3'], ['C2', 'C4'], 
            ['C3', 'C5'], ['C4', 'C5'], ['C4', 'C6'], ['C5', 'C7'], ['C6', 'C7']
        ];
        
        console.log('Loading Problem 02 with courses:', courses);
        console.log('Loading Problem 02 with conflicts:', conflicts);
        
        courses.forEach(course => this.addCourse(course));
        conflicts.forEach(conflict => this.addConflict(conflict[0], conflict[1]));
        
        // Force visualization update
        setTimeout(() => {
            console.log('Forcing visualization update');
            this.visualizeGraph();
            this.updateColorLegend();
            this.updateExamSchedule();
            this.updateStatistics();
        }, 500);
        
        console.log('Problem 02 loaded successfully');
    }

    clearAll() {
        this.courses = [];
        this.conflicts = [];
        this.adjacencyList = {};
        this.colors = {};
        this.updateCourseList();
        this.updateConflictList();
        this.updateConflictDropdowns();
        this.updateStatistics();
        this.updateColorLegend();
        this.updateExamSchedule();
        this.visualizeGraph();
    }
}

// Initialize the application
let app;

// Event Handlers
function addCourse() {
    const input = document.getElementById('courseInput');
    const courseName = input.value.trim().toUpperCase();
    
    if (app.addCourse(courseName)) {
        input.value = '';
        app.visualizeGraph();
    } else {
        alert('Invalid or duplicate course name!');
    }
}

function addConflict() {
    const course1 = document.getElementById('conflict1').value;
    const course2 = document.getElementById('conflict2').value;
    
    if (app.addConflict(course1, course2)) {
        document.getElementById('conflict1').value = '';
        document.getElementById('conflict2').value = '';
    } else {
        alert('Invalid conflict!');
    }
}

function runGreedyColoring() {
    if (app.courses.length === 0) {
        alert('Please add courses first!');
        return;
    }
    
    app.greedyColoring();
    app.visualizeGraph();
    app.updateColorLegend();
    app.updateExamSchedule();
    app.updateStatistics();
    
    // Show success message
    const container = document.getElementById('examSchedule');
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message fade-in';
    successMsg.innerHTML = '<i class="fas fa-check-circle"></i>Graph coloring completed successfully!';
    container.insertBefore(successMsg, container.firstChild);
    
    setTimeout(() => {
        if (successMsg.parentNode) {
            successMsg.remove();
        }
    }, 3000);
}

function clearAll() {
    if (confirm('Are you sure you want to clear all data?')) {
        app.clearAll();
    }
}

function runLiveDemo() {
    app.runLiveDemo();
}

function stepByStepColoring() {
    app.stepByStepColoring();
}

function compareAlgorithms() {
    app.compareAlgorithms();
}

function showAlgorithmAnalysis() {
    app.showAlgorithmAnalysis();
}

function generateReport() {
    app.generateReport();
}

function addCourse() {
    app.addCourse();
}

function addConflict() {
    app.addConflict();
}

function runGreedyColoring() {
    app.runGreedyColoring();
}

function clearAll() {
    if (confirm('Are you sure you want to clear all data?')) {
        app.clearAll();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    app = new GraphColoringApp();
    
    // Add enter key support for course input
    document.getElementById('courseInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addCourse();
        }
    });
});
