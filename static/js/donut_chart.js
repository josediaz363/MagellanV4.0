/**
 * Magellan EV Tracker - Consolidated Donut Chart Visualization (Quantity Based)
 * Version: 1.42
 * 
 * This file adds donut chart visualizations to all three pages:
 * - Dashboard
 * - Project Overview
 * - Sub Job Overview
 * 
 * Each page gets its own donut chart showing the correct progress percentage
 * dynamically calculated from actual work item data, prioritizing Quantities.
 * 
 * This version includes UI/UX layout improvements for the dashboard page.
 */

document.addEventListener("DOMContentLoaded", function() {
    console.log("Magellan EV Tracker - Initializing QUANTITY BASED consolidated donut chart");
    
    // Determine which page we're on
    const currentPath = window.location.pathname;
    
    if (currentPath === "/" || currentPath.endsWith("/index")) {
        // Dashboard page
        console.log("Detected dashboard page, initializing dashboard chart");
        setTimeout(initializeDashboardChart, 500); // Delay to ensure DOM is ready
        setTimeout(initializeDashboardMetrics, 600); // Initialize metrics after chart
        setTimeout(fixDashboardLayout, 700); // Fix dashboard layout after all elements are initialized
    } else if (currentPath.includes("/project/")) {
        // Project Overview page
        console.log("Detected project overview page, initializing project chart");
        setTimeout(initializeProjectChart, 500); // Delay to ensure DOM is ready
    } else if (currentPath.includes("/sub_job/")) {
        // Sub Job Overview page
        console.log("Detected sub job overview page, initializing sub job chart");
        setTimeout(initializeSubJobChart, 500); // Delay to ensure DOM is ready
    } else {
        console.log("Not on a page that needs a donut chart");
    }
    
    // Dashboard Page Chart
    function initializeDashboardChart() {
        console.log("Initializing dashboard donut chart");
        
        try {
            // Find the metrics container - try different selectors
            let metricsContainer = document.querySelector(".metrics-container");
            if (!metricsContainer) {
                metricsContainer = document.querySelector(".metrics-grid");
            }
            if (!metricsContainer) {
                // Try to find any container that might work
                metricsContainer = document.querySelector(".content > div");
            }
            
            if (!metricsContainer) {
                console.log("No suitable container found for dashboard chart");
                // Try to find the Project Dashboard heading as a fallback
                const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
                const dashboardHeading = headings.find(h => h.textContent.includes("Project Dashboard"));
                if (dashboardHeading) {
                    metricsContainer = dashboardHeading.parentNode;
                } else {
                    // Last resort: use the main content div
                    metricsContainer = document.querySelector(".content");
                    if (!metricsContainer) {
                        console.error("Could not find any suitable container for dashboard chart");
                        return;
                    }
                }
            }
            
            console.log("Found container for dashboard chart:", metricsContainer);
            
            // Create chart container
            const chartContainer = document.createElement("div");
            chartContainer.id = "dashboard-donut-chart-container";
            chartContainer.className = "donut-chart-container";
            chartContainer.style.cssText = "margin-bottom: 20px; text-align: center; position: relative;";
            
            // Insert the chart container before the metrics container
            metricsContainer.parentNode.insertBefore(chartContainer, metricsContainer);
            
            // Create title for the chart
            const title = document.createElement("h4");
            title.className = "chart-title";
            title.textContent = "Overall Progress";
            title.style.cssText = "margin-bottom: 10px; font-size: 18px;";
            chartContainer.appendChild(title);
            
            // Create canvas for the chart
            const canvas = document.createElement("canvas");
            canvas.id = "dashboardProgressChart";
            canvas.style.cssText = "width: 100%; max-width: 200px; height: auto; margin: 0 auto;";
            chartContainer.appendChild(canvas);
            
            // Create center text container
            const centerText = document.createElement("div");
            centerText.className = "chart-center-text";
            centerText.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;";
            chartContainer.appendChild(centerText);
            
            // Calculate progress from work items table
            let progressValue = calculateDashboardProgress();
            console.log(`Final dashboard progress value: ${progressValue}%`);
            
            // Create percentage display
            const percentage = document.createElement("span");
            percentage.className = "progress-percentage";
            percentage.textContent = `${Math.round(progressValue)}%`;
            percentage.style.cssText = "display: block; font-size: 24px; font-weight: bold;";
            centerText.appendChild(percentage);
            
            // Create label
            const label = document.createElement("span");
            label.className = "progress-label";
            label.textContent = "Complete";
            label.style.cssText = "display: block; font-size: 14px;";
            centerText.appendChild(label);
            
            // Create or update the chart
            const ctx = canvas.getContext("2d");
            
            // Check if Chart is available
            if (typeof Chart === "undefined") {
                console.error("Chart.js is not available");
                return;
            }
            
            // Create new chart
            try {
                window.dashboardProgressChart = new Chart(ctx, {
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
                        cutout: "75%",
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.label + ": " + context.raw + "%";
                                    }
                                }
                            }
                        }
                    }
                });
                console.log("Created dashboard progress chart");
            } catch (error) {
                console.error("Error creating dashboard progress chart:", error);
            }
        } catch (error) {
            console.error("Error in dashboard chart initialization:", error);
        }
    }
    
    // Initialize Dashboard Metrics
    function initializeDashboardMetrics() {
        console.log("Initializing dashboard metrics");
        
        try {
            // Find the dashboard container
            const dashboardContainer = document.querySelector(".content > div");
            if (!dashboardContainer) {
                console.error("Could not find dashboard container");
                return;
            }
            
            // Check if metrics grid already exists
            let metricsGrid = document.querySelector(".metrics-grid");
            if (metricsGrid) {
                console.log("Metrics grid already exists");
                return;
            }
            
            // Find the Project Dashboard heading
            const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
            const dashboardHeading = headings.find(h => h.textContent.includes("Project Dashboard"));
            if (!dashboardHeading) {
                console.error("Could not find Project Dashboard heading");
                return;
            }
            
            // Create metrics grid
            metricsGrid = document.createElement("div");
            metricsGrid.className = "metrics-grid";
            metricsGrid.style.cssText = "display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;";
            
            // Create the 4 % complete cards
            const metricData = [
                { title: "To Date Actual % Complete", value: "0.0%" },
                { title: "To Date Plan % Complete", value: "0.0%" },
                { title: "Weekly Actual % Complete", value: "0.0%" },
                { title: "Weekly Plan % Complete", value: "0.0%" }
            ];
            
            metricData.forEach(metric => {
                const card = document.createElement("div");
                card.className = "metric-card";
                card.style.cssText = "background-color: #0a3d50; padding: 15px; border-radius: 5px; text-align: center;";
                
                const title = document.createElement("div");
                title.className = "title";
                title.textContent = metric.title;
                title.style.cssText = "font-size: 14px; margin-bottom: 10px;";
                card.appendChild(title);
                
                const value = document.createElement("div");
                value.className = "value";
                value.textContent = metric.value;
                value.style.cssText = "font-size: 24px; font-weight: bold; color: #4CAF50;";
                card.appendChild(value);
                
                metricsGrid.appendChild(card);
            });
            
            // Insert metrics grid after the dashboard heading
            dashboardHeading.parentNode.insertBefore(metricsGrid, dashboardHeading.nextSibling);
            console.log("Added metrics grid with 4 % complete cards");
            
        } catch (error) {
            console.error("Error initializing dashboard metrics:", error);
        }
    }
    
    // Fix Dashboard Layout
    function fixDashboardLayout() {
        console.log("Fixing dashboard layout");
        
        try {
            // 1. Remove the empty container at the top
            const emptyContainers = document.querySelectorAll(".content > div > div");
            if (emptyContainers.length > 0) {
                // The first div is likely the empty container to remove
                const emptyContainer = emptyContainers[0];
                if (emptyContainer && !emptyContainer.querySelector("h1, h2, h3, h4, h5, h6, p, table, canvas")) {
                    console.log("Removing empty container at the top");
                    emptyContainer.remove();
                }
            }
            
            // 2. Move the donut chart below the % complete cards
            const donutChartContainer = document.getElementById("dashboard-donut-chart-container");
            if (donutChartContainer) {
                // Find the % complete cards container
                const percentCompleteCards = document.querySelector(".metrics-grid");
                if (percentCompleteCards) {
                    console.log("Found % complete cards container");
                    
                    // Find the Recent Work Items section
                    const recentWorkItemsSection = Array.from(document.querySelectorAll("h3, h4, h5, h6")).find(h => 
                        h.textContent.includes("Recent Work Items")
                    );
                    
                    if (recentWorkItemsSection) {
                        console.log("Found Recent Work Items section");
                        const recentWorkItemsContainer = recentWorkItemsSection.parentNode;
                        
                        // Move the donut chart after the % complete cards and before Recent Work Items
                        if (recentWorkItemsContainer.parentNode) {
                            console.log("Moving donut chart below % complete cards and above Recent Work Items");
                            // First remove the donut chart from its current position
                            if (donutChartContainer.parentNode) {
                                donutChartContainer.parentNode.removeChild(donutChartContainer);
                            }
                            
                            // Then insert it before the Recent Work Items section
                            recentWorkItemsContainer.parentNode.insertBefore(donutChartContainer, recentWorkItemsContainer);
                        }
                    } else {
                        console.log("Recent Work Items section not found, inserting after % complete cards");
                        // If Recent Work Items section not found, insert after % complete cards
                        if (percentCompleteCards.parentNode) {
                            // First remove the donut chart from its current position
                            if (donutChartContainer.parentNode) {
                                donutChartContainer.parentNode.removeChild(donutChartContainer);
                            }
                            
                            // Then insert it after the % complete cards
                            if (percentCompleteCards.nextSibling) {
                                percentCompleteCards.parentNode.insertBefore(donutChartContainer, percentCompleteCards.nextSibling);
                            } else {
                                percentCompleteCards.parentNode.appendChild(donutChartContainer);
                            }
                        }
                    }
                }
            }
            
            // 3. Remove any remaining empty space
            const contentDivs = document.querySelectorAll(".content > div > div");
            contentDivs.forEach(div => {
                // If the div is empty or only contains whitespace
                if (div.innerHTML.trim() === "" || !div.querySelector("h1, h2, h3, h4, h5, h6, p, table, canvas, .metric-card")) {
                    console.log("Removing another empty container");
                    div.remove();
                }
            });
            
            console.log("Dashboard layout fixed");
        } catch (error) {
            console.error("Error fixing dashboard layout:", error);
        }
    }
    
    // Project Overview Page Chart
    function initializeProjectChart() {
        console.log("Initializing project donut chart");
        
        try {
            // Find the project overview section - try different selectors
            let projectOverview = document.querySelector(".project-overview");
            if (!projectOverview) {
                // Try to find any container that might work
                const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
                const projectHeading = headings.find(h => h.textContent.includes("Project Overview"));
                if (projectHeading) {
                    projectOverview = projectHeading.parentNode;
                } else {
                    // Last resort: use the main content div
                    projectOverview = document.querySelector(".content > div");
                    if (!projectOverview) {
                        console.error("Could not find any suitable container for project chart");
                        return;
                    }
                }
            }
            
            console.log("Found container for project chart:", projectOverview);
            
            // Calculate progress from project data
            let progressValue = calculateProjectProgress();
            console.log(`Final project progress value: ${progressValue}%`);
            
            // Create chart container if it doesn't exist
            let chartContainer = document.getElementById("project-donut-chart-container");
            if (!chartContainer) {
                chartContainer = document.createElement("div");
                chartContainer.id = "project-donut-chart-container";
                chartContainer.className = "donut-chart-container";
                chartContainer.style.cssText = "margin-bottom: 20px; text-align: center; position: relative;";
                
                // Insert the chart container at the beginning of the project overview section
                projectOverview.insertBefore(chartContainer, projectOverview.firstChild);
            } else {
                // Clear existing content
                chartContainer.innerHTML = "";
            }
            
            // Create title for the chart
            const title = document.createElement("h4");
            title.className = "chart-title";
            title.textContent = "Overall Progress";
            title.style.cssText = "margin-bottom: 10px; font-size: 18px;";
            chartContainer.appendChild(title);
            
            // Create canvas for the chart
            const canvas = document.createElement("canvas");
            canvas.id = "projectProgressChart";
            canvas.style.cssText = "width: 100%; max-width: 200px; height: auto; margin: 0 auto;";
            chartContainer.appendChild(canvas);
            
            // Create center text container
            const centerText = document.createElement("div");
            centerText.className = "chart-center-text";
            centerText.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;";
            chartContainer.appendChild(centerText);
            
            // Create percentage display
            const percentage = document.createElement("span");
            percentage.className = "progress-percentage";
            percentage.textContent = `${Math.round(progressValue)}%`;
            percentage.style.cssText = "display: block; font-size: 24px; font-weight: bold;";
            centerText.appendChild(percentage);
            
            // Create label
            const label = document.createElement("span");
            label.className = "progress-label";
            label.textContent = "Complete";
            label.style.cssText = "display: block; font-size: 14px;";
            centerText.appendChild(label);
            
            // Create or update the chart
            const ctx = canvas.getContext("2d");
            
            // Check if Chart is available
            if (typeof Chart === "undefined") {
                console.error("Chart.js is not available");
                return;
            }
            
            // Create new chart
            try {
                window.projectProgressChart = new Chart(ctx, {
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
                        cutout: "75%",
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.label + ": " + context.raw + "%";
                                    }
                                }
                            }
                        }
                    }
                });
                console.log("Created project progress chart");
                
                // Update the progress value in any metrics cards
                const metricsGrid = document.querySelector(".metrics-grid");
                if (metricsGrid) {
                    const progressCards = Array.from(metricsGrid.querySelectorAll(".metric-card")).filter(card => {
                        return card.querySelector(".title")?.textContent.includes("Overall Progress");
                    });
                    
                    progressCards.forEach(card => {
                        const valueElement = card.querySelector(".value");
                        if (valueElement) {
                            valueElement.textContent = `${Math.round(progressValue)}%`;
                            console.log("Updated progress card value");
                        }
                    });
                }
                
            } catch (error) {
                console.error("Error creating project progress chart:", error);
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
                console.log("Sub job overview section not found, looking for alternative container");
                // Try to find an alternative container
                const contentDiv = document.querySelector(".content > div");
                if (!contentDiv) {
                    console.log("No suitable container found for sub job chart");
                    return;
                }
            }
            
            // Calculate progress from work items table
            let progressValue = calculateSubJobProgress();
            console.log(`Final sub job progress value: ${progressValue}%`);
            
            // Store the sub job progress in localStorage for the project page to use
            try {
                // Get the sub job ID from the URL
                const subJobId = window.location.pathname.split("/").pop();
                if (subJobId) {
                    localStorage.setItem(`subJobProgress_${subJobId}`, progressValue.toString());
                    localStorage.setItem(`subJobProgressMethod_${subJobId}`, "quantity");
                    console.log(`Stored sub job progress in localStorage: ${progressValue}% for sub job ${subJobId}`);
                }
            } catch (error) {
                console.error("Error storing sub job progress in localStorage:", error);
            }
            
            // Create chart container if it doesn't exist
            let chartContainer = document.getElementById("sub-job-donut-chart-container");
            if (!chartContainer) {
                chartContainer = document.createElement("div");
                chartContainer.id = "sub-job-donut-chart-container";
                chartContainer.className = "donut-chart-container";
                chartContainer.style.cssText = "margin-bottom: 20px; text-align: center; position: relative;";
                
                // Find the best place to insert the chart
                if (subJobOverview) {
                    // Insert the chart container at the beginning of the sub job overview section
                    subJobOverview.insertBefore(chartContainer, subJobOverview.firstChild);
                } else {
                    // Try to find the metrics grid as a fallback
                    const metricsGrid = document.querySelector(".metrics-grid");
                    if (metricsGrid) {
                        // Insert the chart container before the metrics grid
                        metricsGrid.parentNode.insertBefore(chartContainer, metricsGrid);
                    } else {
                        // Last resort: use the main content div
                        const contentDiv = document.querySelector(".content > div");
                        if (contentDiv) {
                            contentDiv.insertBefore(chartContainer, contentDiv.firstChild);
                        } else {
                            console.error("Could not find any suitable container for sub job chart");
                            return;
                        }
                    }
                }
            } else {
                // Clear existing content
                chartContainer.innerHTML = "";
            }
            
            // Create title for the chart
            const title = document.createElement("h4");
            title.className = "chart-title";
            title.textContent = "Overall Progress";
            title.style.cssText = "margin-bottom: 10px; font-size: 18px;";
            chartContainer.appendChild(title);
            
            // Create canvas for the chart
            const canvas = document.createElement("canvas");
            canvas.id = "subJobProgressChart";
            canvas.style.cssText = "width: 100%; max-width: 200px; height: auto; margin: 0 auto;";
            chartContainer.appendChild(canvas);
            
            // Create center text container
            const centerText = document.createElement("div");
            centerText.className = "chart-center-text";
            centerText.style.cssText = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;";
            chartContainer.appendChild(centerText);
            
            // Create percentage display
            const percentage = document.createElement("span");
            percentage.className = "progress-percentage";
            percentage.textContent = `${Math.round(progressValue)}%`;
            percentage.style.cssText = "display: block; font-size: 24px; font-weight: bold;";
            centerText.appendChild(percentage);
            
            // Create label
            const label = document.createElement("span");
            label.className = "progress-label";
            label.textContent = "Complete";
            label.style.cssText = "display: block; font-size: 14px;";
            centerText.appendChild(label);
            
            // Create or update the chart
            const ctx = canvas.getContext("2d");
            
            // Check if Chart is available
            if (typeof Chart === "undefined") {
                console.error("Chart.js is not available");
                return;
            }
            
            // Create new chart
            try {
                window.subJobProgressChart = new Chart(ctx, {
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
                        cutout: "75%",
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.label + ": " + context.raw + "%";
                                    }
                                }
                            }
                        }
                    }
                });
                console.log("Created sub job progress chart");
                
                // Update the progress value in any metrics cards
                const metricsGrid = document.querySelector(".metrics-grid");
                if (metricsGrid) {
                    const progressCards = Array.from(metricsGrid.querySelectorAll(".metric-card")).filter(card => {
                        return card.querySelector(".title")?.textContent.includes("Overall Progress");
                    });
                    
                    progressCards.forEach(card => {
                        const valueElement = card.querySelector(".value");
                        if (valueElement) {
                            valueElement.textContent = `${Math.round(progressValue)}%`;
                            console.log("Updated progress card value");
                        }
                    });
                }
                
            } catch (error) {
                console.error("Error creating sub job progress chart:", error);
            }
        } catch (error) {
            console.error("Error in sub job chart initialization:", error);
        }
    }
    
    // Helper function to calculate dashboard progress
    function calculateDashboardProgress() {
        try {
            console.log("Calculating dashboard progress (Quantity Priority)");
            
            // Find the work items table
            const tables = document.querySelectorAll("table");
            let workItemsTable = null;
            
            // Find the table that looks like a work items table
            for (let i = 0; i < tables.length; i++) {
                const table = tables[i];
                const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim().toLowerCase());
                console.log(`Table ${i + 1} headers:`, headers);
                
                if (headers.some(h => h.includes("work item")) || headers.some(h => h.includes("cost code"))) {
                    workItemsTable = table;
                    console.log(`Found work items table (Table ${i + 1})`);
                    break;
                }
            }
            
            if (workItemsTable) {
                // Get all work item rows except the header
                const rows = Array.from(workItemsTable.querySelectorAll("tbody tr"));
                if (rows.length === 0) {
                    console.log("No work items found in table");
                    return 0;
                }
                
                console.log(`Found ${rows.length} rows in work items table`);
                
                const headers = Array.from(workItemsTable.querySelectorAll("thead th"));
                
                // *** START QUANTITY CALCULATION ***
                let totalBudgetedQuantity = 0;
                let totalEarnedQuantity = 0;
                let budgetedQtyIndex = -1;
                let earnedQtyIndex = -1;
                let foundQuantities = false;
                
                // Find quantity columns by header
                headers.forEach((header, idx) => {
                    const headerText = header.textContent.trim().toLowerCase();
                    if (headerText.includes("budgeted quantity")) {
                        budgetedQtyIndex = idx;
                        console.log(`Found budgeted quantity column at index ${budgetedQtyIndex}`);
                    } else if (headerText.includes("earned quantity")) {
                        earnedQtyIndex = idx;
                        console.log(`Found earned quantity column at index ${earnedQtyIndex}`);
                    }
                });
                
                // If both quantity columns are found, calculate using quantities
                if (budgetedQtyIndex >= 0 && earnedQtyIndex >= 0) {
                    console.log("Calculating progress using QUANTITIES");
                    rows.forEach((row, index) => {
                        console.log(`Processing row ${index + 1} for quantities`);
                        const cells = row.querySelectorAll("td");
                        
                        let budgetedQuantity = 0;
                        let earnedQuantity = 0;
                        
                        if (budgetedQtyIndex < cells.length) {
                            const budgetedQtyText = cells[budgetedQtyIndex].textContent.trim().split(" ")[0]; // Extract number before unit
                            budgetedQuantity = parseFloat(budgetedQtyText) || 0;
                            console.log(`Row ${index + 1} budgeted quantity: ${budgetedQuantity}`);
                        }
                        
                        if (earnedQtyIndex < cells.length) {
                            const earnedQtyText = cells[earnedQtyIndex].textContent.trim().split(" ")[0]; // Extract number before unit
                            earnedQuantity = parseFloat(earnedQtyText) || 0;
                            console.log(`Row ${index + 1} earned quantity: ${earnedQuantity}`);
                        }
                        
                        totalBudgetedQuantity += budgetedQuantity;
                        totalEarnedQuantity += earnedQuantity;
                    });
                    
                    console.log(`Total Budgeted Quantity = ${totalBudgetedQuantity}, Total Earned Quantity = ${totalEarnedQuantity}`);
                    
                    if (totalBudgetedQuantity > 0) {
                        const progress = (totalEarnedQuantity / totalBudgetedQuantity) * 100;
                        console.log(`Calculated dashboard progress from QUANTITIES: ${progress.toFixed(2)}% (${totalEarnedQuantity}/${totalBudgetedQuantity})`);
                        return progress;
                    } else {
                        console.log("Budgeted Quantity is zero, cannot calculate progress from quantities.");
                    }
                } else {
                    console.log("Quantity columns not found, falling back...");
                }
                // *** END QUANTITY CALCULATION ***
                
                // Fallback 1: Try to calculate from the Progress column
                console.log("Fallback 1: Trying to calculate from Progress column");
                let progressIndex = -1;
                headers.forEach((header, idx) => {
                    if (header.textContent.trim().toLowerCase().includes("progress")) {
                        progressIndex = idx;
                        console.log(`Found progress column at index ${progressIndex}`);
                    }
                });
                
                if (progressIndex >= 0) {
                    let totalProgress = 0;
                    let rowCount = 0;
                    
                    rows.forEach((row, index) => {
                        const cells = row.querySelectorAll("td");
                        if (progressIndex < cells.length) {
                            const progressText = cells[progressIndex].textContent.trim().replace("%", "");
                            const progress = parseFloat(progressText) || 0;
                            console.log(`Row ${index + 1} progress: ${progress}%`);
                            totalProgress += progress;
                            rowCount++;
                        }
                    });
                    
                    if (rowCount > 0) {
                        const avgProgress = totalProgress / rowCount;
                        console.log(`Calculated average progress from progress column: ${avgProgress.toFixed(2)}%`);
                        return avgProgress;
                    }
                }
                
                // Fallback 2: Try to calculate from earned and budgeted hours
                console.log("Fallback 2: Trying to calculate from Hours columns");
                let totalBudgetedHours = 0;
                let totalEarnedHours = 0;
                let budgetedHrsIndex = -1;
                let earnedHrsIndex = -1;
                
                headers.forEach((header, idx) => {
                    const headerText = header.textContent.trim().toLowerCase();
                    if (headerText.includes("budgeted hours")) {
                        budgetedHrsIndex = idx;
                        console.log(`Found budgeted hours column at index ${budgetedHrsIndex}`);
                    } else if (headerText.includes("earned hours")) {
                        earnedHrsIndex = idx;
                        console.log(`Found earned hours column at index ${earnedHrsIndex}`);
                    }
                });
                
                if (budgetedHrsIndex >= 0 && earnedHrsIndex >= 0) {
                    rows.forEach((row, index) => {
                        console.log(`Processing row ${index + 1} for hours`);
                        const cells = row.querySelectorAll("td");
                        
                        let budgetedHours = 0;
                        let earnedHours = 0;
                        
                        if (budgetedHrsIndex < cells.length) {
                            const budgetedHoursText = cells[budgetedHrsIndex].textContent.trim();
                            budgetedHours = parseFloat(budgetedHoursText) || 0;
                            console.log(`Row ${index + 1} budgeted hours: ${budgetedHours}`);
                        }
                        
                        if (earnedHrsIndex < cells.length) {
                            const earnedHoursText = cells[earnedHrsIndex].textContent.trim();
                            earnedHours = parseFloat(earnedHoursText) || 0;
                            console.log(`Row ${index + 1} earned hours: ${earnedHours}`);
                        }
                        
                        totalBudgetedHours += budgetedHours;
                        totalEarnedHours += earnedHours;
                    });
                    
                    console.log(`Total Budgeted Hours = ${totalBudgetedHours}, Total Earned Hours = ${totalEarnedHours}`);
                    
                    if (totalBudgetedHours > 0) {
                        const progress = (totalEarnedHours / totalBudgetedHours) * 100;
                        console.log(`Calculated dashboard progress from HOURS: ${progress.toFixed(2)}% (${totalEarnedHours}/${totalBudgetedHours})`);
                        return progress;
                    }
                }
            }
            
            // If we couldn't calculate from the table, return 0
            console.log("Could not calculate dashboard progress from any method");
            return 0;
        } catch (error) {
            console.error("Error calculating dashboard progress:", error);
            return 0; // Return 0 on error
        }
    }
    
    // Helper function to calculate project progress
    function calculateProjectProgress() {
        try {
            console.log("Calculating project progress (Quantity Priority)");
            
            // Look for sub jobs table
            console.log("Looking for sub jobs table to calculate from quantities");
            const tables = document.querySelectorAll("table");
            let subJobsTable = null;
            
            // Find the table that looks like a sub jobs table
            for (let i = 0; i < tables.length; i++) {
                const table = tables[i];
                const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim().toLowerCase());
                console.log(`Table ${i + 1} headers:`, headers);
                
                if (headers.some(h => h.includes("sub job")) || 
                    headers.some(h => h.includes("discipline")) || 
                    headers.some(h => h.includes("area"))) {
                    subJobsTable = table;
                    console.log(`Found sub jobs table (Table ${i + 1})`);
                    break;
                }
            }
            
            if (subJobsTable) {
                // Get all sub job rows except the header
                const rows = Array.from(subJobsTable.querySelectorAll("tbody tr"));
                if (rows.length === 0) {
                    console.log("No sub jobs found in table");
                    return 0; // Return 0 if no sub jobs
                }
                
                console.log(`Found ${rows.length} rows in sub jobs table`);
                
                // Get the headers to find quantity columns
                const headers = Array.from(subJobsTable.querySelectorAll("thead th"));
                
                // Try to find budgeted quantity and earned quantity columns
                let budgetedQtyIndex = -1;
                let earnedQtyIndex = -1;
                
                headers.forEach((header, idx) => {
                    const headerText = header.textContent.trim().toLowerCase();
                    if (headerText.includes("budgeted quantity")) {
                        budgetedQtyIndex = idx;
                        console.log(`Found budgeted quantity column at index ${budgetedQtyIndex}`);
                    } else if (headerText.includes("earned quantity")) {
                        earnedQtyIndex = idx;
                        console.log(`Found earned quantity column at index ${earnedQtyIndex}`);
                    }
                });
                
                // If both quantity columns are found, calculate using quantities
                if (budgetedQtyIndex >= 0 && earnedQtyIndex >= 0) {
                    console.log("Calculating project progress using QUANTITIES from sub jobs table");
                    
                    let totalBudgetedQuantity = 0;
                    let totalEarnedQuantity = 0;
                    
                    rows.forEach((row, index) => {
                        console.log(`Processing sub job row ${index + 1} for quantities`);
                        const cells = row.querySelectorAll("td");
                        
                        let budgetedQuantity = 0;
                        let earnedQuantity = 0;
                        
                        if (budgetedQtyIndex < cells.length) {
                            const budgetedQtyText = cells[budgetedQtyIndex].textContent.trim().split(" ")[0]; // Extract number before unit
                            budgetedQuantity = parseFloat(budgetedQtyText) || 0;
                            console.log(`Sub job ${index + 1} budgeted quantity: ${budgetedQuantity}`);
                        }
                        
                        if (earnedQtyIndex < cells.length) {
                            const earnedQtyText = cells[earnedQtyIndex].textContent.trim().split(" ")[0]; // Extract number before unit
                            earnedQuantity = parseFloat(earnedQtyText) || 0;
                            console.log(`Sub job ${index + 1} earned quantity: ${earnedQuantity}`);
                        }
                        
                        totalBudgetedQuantity += budgetedQuantity;
                        totalEarnedQuantity += earnedQuantity;
                    });
                    
                    console.log(`Total Budgeted Quantity = ${totalBudgetedQuantity}, Total Earned Quantity = ${totalEarnedQuantity}`);
                    
                    if (totalBudgetedQuantity > 0) {
                        const progress = (totalEarnedQuantity / totalBudgetedQuantity) * 100;
                        console.log(`Calculated project progress from QUANTITIES: ${progress.toFixed(2)}% (${totalEarnedQuantity}/${totalBudgetedQuantity})`);
                        return progress;
                    } else {
                        console.log("Total Budgeted Quantity is zero, cannot calculate progress from quantities.");
                    }
                }
                
                // If quantity columns aren't found, try to extract quantities from each sub job
                console.log("Quantity columns not found in sub jobs table, trying to extract quantities from each sub job");
                
                // Try to find sub job IDs and links
                let subJobIds = [];
                let subJobLinks = [];
                
                rows.forEach((row, index) => {
                    const cells = row.querySelectorAll("td");
                    const links = row.querySelectorAll("a");
                    
                    for (let i = 0; i < links.length; i++) {
                        const href = links[i].getAttribute("href");
                        if (href && href.includes("/sub_job/")) {
                            const subJobId = href.split("/").pop();
                            subJobIds.push(subJobId);
                            subJobLinks.push(href);
                            console.log(`Found sub job ID: ${subJobId} with link: ${href}`);
                            break;
                        }
                    }
                });
                
                if (subJobIds.length > 0) {
                    console.log(`Found ${subJobIds.length} sub job IDs`);
                    
                    // Try to get progress values from localStorage
                    let totalBudgetedQuantity = 0;
                    let totalEarnedQuantity = 0;
                    let validSubJobs = 0;
                    
                    // First, try to find quantity values in the table rows
                    rows.forEach((row, index) => {
                        if (index < subJobIds.length) {
                            const subJobId = subJobIds[index];
                            
                            // Try to find quantity values in the row
                            const cells = row.querySelectorAll("td");
                            
                            // Look for cells that might contain quantity values
                            let budgetedQuantity = 0;
                            let earnedQuantity = 0;
                            let foundQuantities = false;
                            
                            for (let i = 0; i < cells.length; i++) {
                                const cellText = cells[i].textContent.trim();
                                
                                // Look for cells that contain numeric values with units (e.g., "1000 CYD")
                                if (cellText.match(/\d+(\.\d+)?\s+[A-Za-z]+/)) {
                                    console.log(`Found potential quantity cell: "${cellText}" in sub job ${subJobId}`);
                                    
                                    // If we find two such cells, assume the first is budgeted and the second is earned
                                    if (budgetedQuantity === 0) {
                                        const qtyValue = parseFloat(cellText.split(" ")[0]) || 0;
                                        budgetedQuantity = qtyValue;
                                        console.log(`Assuming budgeted quantity: ${budgetedQuantity} for sub job ${subJobId}`);
                                    } else if (earnedQuantity === 0) {
                                        const qtyValue = parseFloat(cellText.split(" ")[0]) || 0;
                                        earnedQuantity = qtyValue;
                                        console.log(`Assuming earned quantity: ${earnedQuantity} for sub job ${subJobId}`);
                                        foundQuantities = true;
                                    }
                                }
                            }
                            
                            if (foundQuantities && budgetedQuantity > 0) {
                                totalBudgetedQuantity += budgetedQuantity;
                                totalEarnedQuantity += earnedQuantity;
                                validSubJobs++;
                                console.log(`Added quantities for sub job ${subJobId}: ${earnedQuantity}/${budgetedQuantity}`);
                            }
                        }
                    });
                    
                    // If we found valid quantities in the table, calculate progress
                    if (validSubJobs > 0 && totalBudgetedQuantity > 0) {
                        const progress = (totalEarnedQuantity / totalBudgetedQuantity) * 100;
                        console.log(`Calculated project progress from extracted quantities: ${progress.toFixed(2)}% (${totalEarnedQuantity}/${totalBudgetedQuantity})`);
                        return progress;
                    }
                    
                    // If we couldn't find quantities in the table, try localStorage
                    console.log("Trying to get progress values from localStorage");
                    
                    let totalProgress = 0;
                    let validValues = 0;
                    
                    subJobIds.forEach(subJobId => {
                        const progressKey = `subJobProgress_${subJobId}`;
                        const methodKey = `subJobProgressMethod_${subJobId}`;
                        
                        if (localStorage.getItem(progressKey)) {
                            const progress = parseFloat(localStorage.getItem(progressKey)) || 0;
                            const method = localStorage.getItem(methodKey) || "";
                            
                            // Prioritize quantity-based progress values
                            if (method === "quantity") {
                                totalProgress += progress;
                                validValues++;
                                console.log(`Found quantity-based progress in localStorage: ${progress}% for sub job ${subJobId}`);
                            } else if (validValues === 0) {
                                // Only use non-quantity values if we don't have any quantity values
                                totalProgress += progress;
                                validValues++;
                                console.log(`Found progress in localStorage: ${progress}% for sub job ${subJobId}`);
                            }
                        }
                    });
                    
                    if (validValues > 0) {
                        const avgProgress = totalProgress / validValues;
                        console.log(`Calculated project progress from localStorage: ${avgProgress.toFixed(2)}%`);
                        return avgProgress;
                    }
                }
                
                // If we couldn't calculate from quantities, try to calculate from progress column
                console.log("Trying to calculate from Progress column in sub jobs table");
                
                let progressIndex = -1;
                headers.forEach((header, idx) => {
                    if (header.textContent.trim().toLowerCase().includes("progress")) {
                        progressIndex = idx;
                        console.log(`Found progress column at index ${progressIndex}`);
                    }
                });
                
                if (progressIndex >= 0) {
                    let totalBudgetedQuantity = 0;
                    let totalWeightedProgress = 0;
                    
                    rows.forEach((row, index) => {
                        const cells = row.querySelectorAll("td");
                        if (progressIndex < cells.length) {
                            const progressText = cells[progressIndex].textContent.trim().replace("%", "");
                            const progress = parseFloat(progressText) || 0;
                            
                            // Try to find a quantity value to use as weight
                            let weight = 1; // Default weight
                            
                            // Look for a cell that might contain a quantity value
                            for (let i = 0; i < cells.length; i++) {
                                const cellText = cells[i].textContent.trim();
                                if (cellText.match(/\d+(\.\d+)?\s+[A-Za-z]+/)) {
                                    const qtyValue = parseFloat(cellText.split(" ")[0]) || 0;
                                    if (qtyValue > 0) {
                                        weight = qtyValue;
                                        console.log(`Using quantity ${weight} as weight for sub job ${index + 1}`);
                                        break;
                                    }
                                }
                            }
                            
                            console.log(`Sub job ${index + 1} progress: ${progress}% with weight ${weight}`);
                            totalWeightedProgress += progress * weight;
                            totalBudgetedQuantity += weight;
                        }
                    });
                    
                    if (totalBudgetedQuantity > 0) {
                        const weightedAvgProgress = totalWeightedProgress / totalBudgetedQuantity;
                        console.log(`Calculated weighted average progress from progress column: ${weightedAvgProgress.toFixed(2)}%`);
                        return weightedAvgProgress;
                    }
                }
            }
            
            // Next, try to get progress directly from the Overall Progress card
            const progressCards = document.querySelectorAll(".metric-card");
            for (let i = 0; i < progressCards.length; i++) {
                const card = progressCards[i];
                const title = card.querySelector(".title");
                if (title && title.textContent.trim().toLowerCase().includes("overall progress")) {
                    const valueElement = card.querySelector(".value");
                    if (valueElement) {
                        const progressText = valueElement.textContent.trim().replace("%", "");
                        const progress = parseFloat(progressText);
                        if (!isNaN(progress)) {
                            console.log(`Found progress directly from card: ${progress}%`);
                            return progress;
                        }
                    }
                }
            }
            
            // If no other method works, return 0
            console.log("Could not calculate project progress from any method");
            return 0;
        } catch (error) {
            console.error("Error calculating project progress:", error);
            return 0; // Return 0 on error
        }
    }
    
    // Helper function to calculate sub job progress
    function calculateSubJobProgress() {
        try {
            console.log("Calculating sub job progress (Quantity Priority)");
            
            // Find the work items table
            const tables = document.querySelectorAll("table");
            let workItemsTable = null;
            
            // Find the table that looks like a work items table
            for (let i = 0; i < tables.length; i++) {
                const table = tables[i];
                const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim().toLowerCase());
                console.log(`Table ${i + 1} headers:`, headers);
                
                if (headers.some(h => h.includes("work item")) || headers.some(h => h.includes("cost code"))) {
                    workItemsTable = table;
                    console.log(`Found work items table (Table ${i + 1})`);
                    break;
                }
            }
            
            if (workItemsTable) {
                // Get all work item rows except the header
                const rows = Array.from(workItemsTable.querySelectorAll("tbody tr"));
                if (rows.length === 0) {
                    console.log("No work items found in table");
                    return 0;
                }
                
                console.log(`Found ${rows.length} rows in work items table`);
                
                const headers = Array.from(workItemsTable.querySelectorAll("thead th"));
                
                // *** START QUANTITY CALCULATION ***
                let totalBudgetedQuantity = 0;
                let totalEarnedQuantity = 0;
                let budgetedQtyIndex = -1;
                let earnedQtyIndex = -1;
                
                // Find quantity columns by header
                headers.forEach((header, idx) => {
                    const headerText = header.textContent.trim().toLowerCase();
                    if (headerText.includes("budgeted quantity")) {
                        budgetedQtyIndex = idx;
                        console.log(`Found budgeted quantity column at index ${budgetedQtyIndex}`);
                    } else if (headerText.includes("earned quantity")) {
                        earnedQtyIndex = idx;
                        console.log(`Found earned quantity column at index ${earnedQtyIndex}`);
                    }
                });
                
                // If both quantity columns are found, calculate using quantities
                if (budgetedQtyIndex >= 0 && earnedQtyIndex >= 0) {
                    console.log("Calculating progress using QUANTITIES");
                    rows.forEach((row, index) => {
                        console.log(`Processing row ${index + 1} for quantities`);
                        const cells = row.querySelectorAll("td");
                        
                        let budgetedQuantity = 0;
                        let earnedQuantity = 0;
                        
                        if (budgetedQtyIndex < cells.length) {
                            const budgetedQtyText = cells[budgetedQtyIndex].textContent.trim().split(" ")[0]; // Extract number before unit
                            budgetedQuantity = parseFloat(budgetedQtyText) || 0;
                            console.log(`Row ${index + 1} budgeted quantity: ${budgetedQuantity}`);
                        }
                        
                        if (earnedQtyIndex < cells.length) {
                            const earnedQtyText = cells[earnedQtyIndex].textContent.trim().split(" ")[0]; // Extract number before unit
                            earnedQuantity = parseFloat(earnedQtyText) || 0;
                            console.log(`Row ${index + 1} earned quantity: ${earnedQuantity}`);
                        }
                        
                        totalBudgetedQuantity += budgetedQuantity;
                        totalEarnedQuantity += earnedQuantity;
                    });
                    
                    console.log(`Total Budgeted Quantity = ${totalBudgetedQuantity}, Total Earned Quantity = ${totalEarnedQuantity}`);
                    
                    if (totalBudgetedQuantity > 0) {
                        const progress = (totalEarnedQuantity / totalBudgetedQuantity) * 100;
                        console.log(`Calculated sub job progress from QUANTITIES: ${progress.toFixed(2)}% (${totalEarnedQuantity}/${totalBudgetedQuantity})`);
                        return progress;
                    } else {
                        console.log("Budgeted Quantity is zero, cannot calculate progress from quantities.");
                    }
                } else {
                    console.log("Quantity columns not found, falling back...");
                }
                // *** END QUANTITY CALCULATION ***
                
                // Fallback 1: Try to calculate from the Progress column
                console.log("Fallback 1: Trying to calculate from Progress column");
                let progressIndex = -1;
                headers.forEach((header, idx) => {
                    if (header.textContent.trim().toLowerCase().includes("progress")) {
                        progressIndex = idx;
                        console.log(`Found progress column at index ${progressIndex}`);
                    }
                });
                
                if (progressIndex >= 0) {
                    let totalProgress = 0;
                    let rowCount = 0;
                    
                    rows.forEach((row, index) => {
                        const cells = row.querySelectorAll("td");
                        if (progressIndex < cells.length) {
                            const progressText = cells[progressIndex].textContent.trim().replace("%", "");
                            const progress = parseFloat(progressText) || 0;
                            console.log(`Row ${index + 1} progress: ${progress}%`);
                            totalProgress += progress;
                            rowCount++;
                        }
                    });
                    
                    if (rowCount > 0) {
                        const avgProgress = totalProgress / rowCount;
                        console.log(`Calculated average progress from progress column: ${avgProgress.toFixed(2)}%`);
                        return avgProgress;
                    }
                }
                
                // Fallback 2: Try to calculate from earned and budgeted hours
                console.log("Fallback 2: Trying to calculate from Hours columns");
                let totalBudgetedHours = 0;
                let totalEarnedHours = 0;
                let budgetedHrsIndex = -1;
                let earnedHrsIndex = -1;
                
                headers.forEach((header, idx) => {
                    const headerText = header.textContent.trim().toLowerCase();
                    if (headerText.includes("budgeted hours")) {
                        budgetedHrsIndex = idx;
                        console.log(`Found budgeted hours column at index ${budgetedHrsIndex}`);
                    } else if (headerText.includes("earned hours")) {
                        earnedHrsIndex = idx;
                        console.log(`Found earned hours column at index ${earnedHrsIndex}`);
                    }
                });
                
                if (budgetedHrsIndex >= 0 && earnedHrsIndex >= 0) {
                    rows.forEach((row, index) => {
                        console.log(`Processing row ${index + 1} for hours`);
                        const cells = row.querySelectorAll("td");
                        
                        let budgetedHours = 0;
                        let earnedHours = 0;
                        
                        if (budgetedHrsIndex < cells.length) {
                            const budgetedHoursText = cells[budgetedHrsIndex].textContent.trim();
                            budgetedHours = parseFloat(budgetedHoursText) || 0;
                            console.log(`Row ${index + 1} budgeted hours: ${budgetedHours}`);
                        }
                        
                        if (earnedHrsIndex < cells.length) {
                            const earnedHoursText = cells[earnedHrsIndex].textContent.trim();
                            earnedHours = parseFloat(earnedHoursText) || 0;
                            console.log(`Row ${index + 1} earned hours: ${earnedHours}`);
                        }
                        
                        totalBudgetedHours += budgetedHours;
                        totalEarnedHours += earnedHours;
                    });
                    
                    console.log(`Total Budgeted Hours = ${totalBudgetedHours}, Total Earned Hours = ${totalEarnedHours}`);
                    
                    if (totalBudgetedHours > 0) {
                        const progress = (totalEarnedHours / totalBudgetedHours) * 100;
                        console.log(`Calculated sub job progress from HOURS: ${progress.toFixed(2)}% (${totalEarnedHours}/${totalBudgetedHours})`);
                        return progress;
                    }
                }
            }
            
            // If we couldn't calculate from the table, try to get from metrics cards
            console.log("Trying to calculate from metrics cards");
            
            const metricsGrid = document.querySelector(".metrics-grid");
            if (metricsGrid) {
                // Try to find quantity cards first
                const budgetedQtyCard = Array.from(metricsGrid.querySelectorAll(".metric-card")).find(card => {
                    return card.querySelector(".title")?.textContent.includes("Budgeted Quantity");
                });
                
                const earnedQtyCard = Array.from(metricsGrid.querySelectorAll(".metric-card")).find(card => {
                    return card.querySelector(".title")?.textContent.includes("Earned Quantity");
                });
                
                if (budgetedQtyCard && earnedQtyCard) {
                    console.log("Found budgeted and earned quantity cards");
                    
                    const budgetedQtyElement = budgetedQtyCard.querySelector(".value");
                    const earnedQtyElement = earnedQtyCard.querySelector(".value");
                    
                    if (budgetedQtyElement && earnedQtyElement) {
                        const budgetedQtyText = budgetedQtyElement.textContent.trim().split(" ")[0];
                        const earnedQtyText = earnedQtyElement.textContent.trim().split(" ")[0];
                        
                        console.log(`Budgeted Quantity Text: "${budgetedQtyText}", Earned Quantity Text: "${earnedQtyText}"`);
                        
                        const budgetedQty = parseFloat(budgetedQtyText) || 0;
                        const earnedQty = parseFloat(earnedQtyText) || 0;
                        
                        console.log(`Budgeted Quantity: ${budgetedQty}, Earned Quantity: ${earnedQty}`);
                        
                        if (budgetedQty > 0) {
                            const progress = (earnedQty / budgetedQty) * 100;
                            console.log(`Calculated sub job progress from QUANTITY cards: ${progress.toFixed(2)}% (${earnedQty}/${budgetedQty})`);
                            return progress;
                        }
                    }
                }
                
                // If quantity cards aren't available, try hours cards
                const budgetedHoursCard = Array.from(metricsGrid.querySelectorAll(".metric-card")).find(card => {
                    return card.querySelector(".title")?.textContent.includes("Budgeted Hours");
                });
                
                const earnedHoursCard = Array.from(metricsGrid.querySelectorAll(".metric-card")).find(card => {
                    return card.querySelector(".title")?.textContent.includes("Earned Hours");
                });
                
                if (budgetedHoursCard && earnedHoursCard) {
                    console.log("Found budgeted and earned hours cards");
                    
                    const budgetedHoursElement = budgetedHoursCard.querySelector(".value");
                    const earnedHoursElement = earnedHoursCard.querySelector(".value");
                    
                    if (budgetedHoursElement && earnedHoursElement) {
                        const budgetedHoursText = budgetedHoursElement.textContent.trim();
                        const earnedHoursText = earnedHoursElement.textContent.trim();
                        
                        console.log(`Budgeted Hours Text: "${budgetedHoursText}", Earned Hours Text: "${earnedHoursText}"`);
                        
                        const budgetedHours = parseFloat(budgetedHoursText) || 0;
                        const earnedHours = parseFloat(earnedHoursText) || 0;
                        
                        console.log(`Budgeted Hours: ${budgetedHours}, Earned Hours: ${earnedHours}`);
                        
                        if (budgetedHours > 0) {
                            const progress = (earnedHours / budgetedHours) * 100;
                            console.log(`Calculated sub job progress from HOURS cards: ${progress.toFixed(2)}% (${earnedHours}/${budgetedHours})`);
                            return progress;
                        }
                    }
                }
                
                // If neither quantity nor hours cards are available, try progress card
                const progressCard = Array.from(metricsGrid.querySelectorAll(".metric-card")).find(card => {
                    return card.querySelector(".title")?.textContent.includes("Overall Progress");
                });
                
                if (progressCard) {
                    console.log("Found overall progress card");
                    
                    const progressElement = progressCard.querySelector(".value");
                    if (progressElement) {
                        const progressText = progressElement.textContent.trim().replace("%", "");
                        const progress = parseFloat(progressText) || 0;
                        
                        console.log(`Progress from card: ${progress}%`);
                        return progress;
                    }
                }
            }
            
            // If we couldn't calculate from any method, return 0
            console.log("Could not calculate sub job progress from any method");
            return 0;
        } catch (error) {
            console.error("Error calculating sub job progress:", error);
            return 0; // Return 0 on error
        }
    }
});
