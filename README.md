# 🎓 Graph Theory & Applications – Exam Scheduling System

A comprehensive web application that solves **exam scheduling problems** using **graph coloring algorithms**, combining theory with real-world applications through interactive visualization.

---

## 📌 Project Overview

This project solves two main problems:

### 🔹 Problem 01: General Graph Coloring
- Greedy graph coloring implementation  
- Algorithm analysis (quality & complexity)  
- Interactive graph visualization  

### 🔹 Problem 02: Exam Scheduling
- Conflict graph construction  
- Automatic time slot generation  
- Visual schedule representation  

---

## 🚀 Features

- ✨ Interactive Graph Builder  
- 📊 Real-time Visualization (D3.js)  
- 🎨 Greedy Coloring Algorithm  
- 🗓️ Exam Schedule Generator  
- 📦 Pre-built Templates  
- 📱 Responsive UI (Tailwind CSS)  

---

## 🧠 Algorithm

### Greedy Graph Coloring

**Steps:**
1. Sort vertices by degree (descending)  
2. Assign colors iteratively  
3. Choose smallest valid color  
4. Ensure no adjacent nodes share same color  

**Why Approximation?**
- No guarantee of optimal solution  
- Runs in polynomial time  
- Uses at most **Δ + 1 colors**  

---

## ⏱️ Complexity

- **Time:** O(V² + E)  
- **Space:** O(V + E)  

Where:
- V = vertices (courses)  
- E = edges (conflicts)  

---

## 📊 Example (Exam Scheduling)

**Courses:**  
C1, C2, C3, C4, C5, C6, C7  

**Conflicts:**  
(C1,C2), (C1,C3), (C2,C3), (C2,C4),  
(C3,C5), (C4,C5), (C4,C6),  
(C5,C7), (C6,C7)  

**Output:**  
- Conflict-free schedule  
- 3–4 time slots  
- Colors = slots  

---

## 🛠️ Tech Stack

- HTML5, CSS3, JavaScript  
- Tailwind CSS  
- D3.js  
- Font Awesome  

---

## 📂 Structure
Graph Theory and Applications/
├── index.html
├── script.js
├── README.md
└── assets/

---

## 🎮 Usage

1. Open `index.html`  
2. Select problem  
3. Add courses & conflicts  
4. Run algorithm  
5. View results  

---

## 📈 Performance

- Efficient for large graphs  
- Near-optimal in practice  
- Optimal for bipartite graphs  

---

## 🔧 Custom Example

```javascript
function loadCustomProblem() {
    app.clearAll();
    const courses = ['C1','C2','C3','C4'];
    const conflicts = [['C1','C2'],['C2','C3'],['C3','C4']];
    
    courses.forEach(c => app.addCourse(c));
    conflicts.forEach(([a,b]) => app.addConflict(a,b));
    
    app.visualizeGraph();
}


---

## 🎓 Learning Outcomes

- Graph coloring concepts  
- Approximation algorithms  
- Complexity analysis  
- Real-world scheduling applications  

---

## 🚀 Future Scope

- Advanced algorithms (DSATUR, Welsh-Powell)  
- Performance comparison of algorithms  
- Export functionality (PDF/CSV)  
- Database integration  

---

## 👨‍💻 Author

**Dhanavath Samith Raj**  
CSE 4th Year | Reg No: 896  

---

> Turning graph theory into real-world solutions 🚀
