/**
 * Magellan EV Tracker - Minimal Donut Chart Visualization
 * Version: 1.0
 * 
 * This file adds basic donut chart visualizations to all three pages:
 * - Dashboard
 * - Project Overview
 * - Sub Job Overview
 */

document.addEventListener("DOMContentLoaded", function() {
    console.log("Magellan EV Tracker - Initializing minimal donut chart");
    
    // Determine which page we're on
    const currentPath = window.location.pathname;
    
    if (currentPath === "/" || currentPath.endsWith("/index")) {
        // Dashboard page
        console.log("Detected dashboard page, initializing dashboard chart");
        setTimeout(initializeDashboardChart, 500);
    } else if (currentPath.includes("/project/")) {
        // Project Overview page
        console.log("Detected project overview page, initializing project chart");
        setTimeout(initializeProjectChart, 500);
    } else if (currentPath.includes("/sub_job/")) {
        // Sub Job Overview page
        console.log("Detected sub job overview page, initializing sub job chart");
        setTimeout(initializeSubJobChart, 500);
    } else {
        console.log("Not on a page that needs a donut chart");
    }
    
    // Dashboard Page Chart
    function initializeDashboardChart() {
        console.log("Initializing dashboard donut chart");
        
        try {
            // Find the main content area
            const contentDiv = document.querySelector(".content");
            if (!contentDiv) {
                console.error("Could not find content div for dashboard chart");
                return;
            }
            
            // Create chart container
            const chartContainer = document.createElement("div");
            chartContainer.id = "dashboard-donut-chart-container";
            chartContainer.style.cssText = "margin: 20px; text-align: center; position: relative; width: 200px; height: 200px;";
            
            // Insert at the beginning of the content div
            contentDiv.insertBefore(chartContainer, contentDiv.firstChild);
            
            // Create title for the chart
            const title = document.createElement("h3");
            title.textContent = "Overall Progress";
            title.style.cssText = "margin-bottom: 10px;";
            chartContainer.appendChild(title);
            
            // Create canvas for the chart
            const canvas = document.createElement("canvas");
            canvas.id = "dashboardProgressChart";
            canvas.width = 200;
            canvas.height = 200;
            chartContainer.appendChild(canvas);
            
            // Fixed progress value for testing
            const progressValue = 50;
            
            // Create or update the chart
            const ctx = canvas.getContext("2d");
            
            // Check if Chart is available
            if (typeof Chart === "undefined") {
                console.error("Chart.js is not available");
                
                // Create a fallback visual representation
                drawFallbackChart(ctx, progressValue);
                return;
            }
            
            // Create new chart
            try {
                new Chart(ctx, {
                    type: "doughnut",
                    data: {
                        labels: ["Complete", "Remaining"],
                        datasets: [{
                            data: [progressValue, 100 - progressValue],
                            backgroundColor: ["#4CAF50", "#2c3034"],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        cutout: "70%",
                        responsive: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                });
                
                // Add center text
                const centerText = document.createElement("div");
                centerText.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;";
                centerText.innerHTML = `<span style="font-size: 24px; font-weight: bold;">${progressValue}%</span><br><span style="font-size: 14px;">Complete</span>`;
                chartContainer.appendChild(centerText);
                
                console.log("Created dashboard progress chart");
            } catch (error) {
                console.error("Error creating dashboard progress chart:", error);
                
                // Create a fallback visual representation
                drawFallbackChart(ctx, progressValue);
            }
        } catch (error) {
            console.error("Error in dashboard chart initialization:", error);
        }
    }
    
    // Project Overview Page Chart
    function initializeProjectChart() {
        console.log("Initializing project donut chart");
        
        try {
            // Find the project overview section
            const projectOverview = document.querySelector(".project-overview");
            if (!projectOverview) {
                // Try to find any container that might work
                const contentDiv = document.querySelector(".content");
                if (!contentDiv) {
                    console.error("Could not find content div for project chart");
                    return;
                }
            }
            
            // Create chart container
            const chartContainer = document.createElement("div");
            chartContainer.id = "project-donut-chart-container";
            chartContainer.style.cssText = "margin: 20px; text-align: center; position: relative; width: 200px; height: 200px;";
            
            // Insert at the beginning of the project overview section or content div
            if (projectOverview) {
                projectOverview.insertBefore(chartContainer, projectOverview.firstChild);
            } else {
                const contentDiv = document.querySelector(".content");
                contentDiv.insertBefore(chartContainer, contentDiv.firstChild);
            }
            
            // Create title for the chart
            const title = document.createElement("h3");
            title.textContent = "Overall Progress";
            title.style.cssText = "margin-bottom: 10px;";
            chartContainer.appendChild(title);
            
            // Create canvas for the chart
            const canvas = document.createElement("canvas");
            canvas.id = "projectProgressChart";
            canvas.width = 200;
            canvas.height = 200;
            chartContainer.appendChild(canvas);
            
            // Fixed progress value for testing
            const progressValue = 50;
            
            // Create or update the chart
            const ctx = canvas.getContext("2d");
            
            // Check if Chart is available
            if (typeof Chart === "undefined") {
                console.error("Chart.js is not available");
                
                // Create a fallback visual representation
                drawFallbackChart(ctx, progressValue);
                return;
            }
            
            // Create new chart
            try {
                new Chart(ctx, {
                    type: "doughnut",
                    data: {
                        labels: ["Complete", "Remaining"],
                        datasets: [{
                            data: [progressValue, 100 - progressValue],
                            backgroundColor: ["#4CAF50", "#2c3034"],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        cutout: "70%",
                        responsive: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                });
                
                // Add center text
                const centerText = document.createElement("div");
                centerText.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;";
                centerText.innerHTML = `<span style="font-size: 24px; font-weight: bold;">${progressValue}%</span><br><span style="font-size: 14px;">Complete</span>`;
                chartContainer.appendChild(centerText);
                
                console.log("Created project progress chart");
            } catch (error) {
                console.error("Error creating project progress chart:", error);
                
                // Create a fallback visual representation
                drawFallbackChart(ctx, progressValue);
            }
        } catch (error) {
            console.error("Error in project chart initialization:", error);
        }
    }
    
    // Sub Job Overview Page Chart
    function initializeSubJobChart() {
        console.log("Initializing sub job donut chart");
        
        try {
            // Find the sub job overview section
            const subJobOverview = document.querySelector(".sub-job-overview");
            if (!subJobOverview) {
                // Try to find any container that might work
                const contentDiv = document.querySelector(".content");
                if (!contentDiv) {
                    console.error("Could not find content div for sub job chart");
                    return;
                }
            }
            
            // Create chart container
            const chartContainer = document.createElement("div");
            chartContainer.id = "sub-job-donut-chart-container";
            chartContainer.style.cssText = "margin: 20px; text-align: center; position: relative; width: 200px; height: 200px;";
            
            // Insert at the beginning of the sub job overview section or content div
            if (subJobOverview) {
                subJobOverview.insertBefore(chartContainer, subJobOverview.firstChild);
            } else {
                const contentDiv = document.querySelector(".content");
                contentDiv.insertBefore(chartContainer, contentDiv.firstChild);
            }
            
            // Create title for the chart
            const title = document.createElement("h3");
            title.textContent = "Overall Progress";
            title.style.cssText = "margin-bottom: 10px;";
            chartContainer.appendChild(title);
            
            // Create canvas for the chart
            const canvas = document.createElement("canvas");
            canvas.id = "subJobProgressChart";
            canvas.width = 200;
            canvas.height = 200;
            chartContainer.appendChild(canvas);
            
            // Fixed progress value for testing
            const progressValue = 50;
            
            // Create or update the chart
            const ctx = canvas.getContext("2d");
            
            // Check if Chart is available
            if (typeof Chart === "undefined") {
                console.error("Chart.js is not available");
                
                // Create a fallback visual representation
                drawFallbackChart(ctx, progressValue);
                return;
            }
            
            // Create new chart
            try {
                new Chart(ctx, {
                    type: "doughnut",
                    data: {
                        labels: ["Complete", "Remaining"],
                        datasets: [{
                            data: [progressValue, 100 - progressValue],
                            backgroundColor: ["#4CAF50", "#2c3034"],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        cutout: "70%",
                        responsive: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                });
                
                // Add center text
                const centerText = document.createElement("div");
                centerText.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;";
                centerText.innerHTML = `<span style="font-size: 24px; font-weight: bold;">${progressValue}%</span><br><span style="font-size: 14px;">Complete</span>`;
                chartContainer.appendChild(centerText);
                
                console.log("Created sub job progress chart");
            } catch (error) {
                console.error("Error creating sub job progress chart:", error);
                
                // Create a fallback visual representation
                drawFallbackChart(ctx, progressValue);
            }
        } catch (error) {
            console.error("Error in sub job chart initialization:", error);
        }
    }
    
    // Fallback function to draw a simple donut chart when Chart.js is not available
    function drawFallbackChart(ctx, progressValue) {
        console.log("Drawing fallback chart with progress:", progressValue);
        
        const centerX = 100;
        const centerY = 100;
        const radius = 80;
        
        // Draw background circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#2c3034";
        ctx.fill();
        
        // Draw progress arc
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, -0.5 * Math.PI, (-0.5 + (progressValue / 50)) * Math.PI);
        ctx.closePath();
        ctx.fillStyle = "#4CAF50";
        ctx.fill();
        
        // Draw inner circle to create donut
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.7, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
        
        // Add text
        ctx.font = "bold 24px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(progressValue + "%", centerX, centerY - 10);
        
        ctx.font = "14px Arial";
        ctx.fillText("Complete", centerX, centerY + 15);
    }
});
