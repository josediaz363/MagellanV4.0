/**
 * Magellan EV Tracker - Consolidated Donut Chart Visualization
 * Version: 1.43
 * 
 * This file adds donut chart visualizations to all three pages:
 * - Dashboard
 * - Project Overview
 * - Sub Job Overview
 * 
 * Each page gets its own donut chart showing the correct progress percentage
 * dynamically calculated from actual work item data using quantities.
 */

document.addEventListener("DOMContentLoaded", function() {
    console.log("Magellan EV Tracker - Initializing consolidated donut chart with quantity-based calculation");
    
    // Determine which page we"re on
    const currentPath = window.location.pathname;
    
    if (currentPath === "/" || currentPath.endsWith("/index")) {
        // Dashboard page
        console.log("Detected dashboard page, initializing dashboard chart");
        setTimeout(initializeDashboardChart, 500); // Longer delay to ensure DOM is ready
    } else if (currentPath.includes("/project/")) {
        // Project Overview page
        console.log("Detected project overview page, initializing project chart");
        setTimeout(initializeProjectChart, 500); // Longer delay to ensure DOM is ready
    } else if (currentPath.includes("/sub_job/")) {
        // Sub Job Overview page
        console.log("Detected sub job overview page, initializing sub job chart");
        setTimeout(initializeSubJobChart, 500); // Longer delay to ensure DOM is ready
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
            
            // Create chart container if it doesn"t exist
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
            
            // Create chart container if it doesn"t exist
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
                        metricsGrid.parentNode.insertBefore(chartContainer, metricsGrid);
                    } else {
                        // Last resort: insert at the beginning of the content div
                        const contentDiv = document.querySelector(".content > div");
                        if (contentDiv) {
                            contentDiv.insertBefore(chartContainer, contentDiv.firstChild);
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
                
                // Store the progress in localStorage for the project page to use
                try {
                    // Try to get the sub job ID from the URL
                    const subJobId = window.location.pathname.split("/").pop();
                    if (subJobId) {
                        localStorage.setItem(`subJob_${subJobId}_progress`, progressValue.toString());
                        localStorage.setItem(`subJob_${subJobId}_progress_type`, "quantity");
                        console.log(`Stored sub job ${subJobId} progress in localStorage: ${progressValue}%`);
                    }
                } catch (e) {
                    console.error("Error storing sub job progress in localStorage:", e);
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
            console.log("Calculating dashboard progress based ONLY on quantities");
            
            // Find the work items table
            const tables = document.querySelectorAll("table");
            let workItemsTable = null;
            
            // Find the table that looks like a work items table
            for (let i = 0; i < tables.length; i++) {
                const table = tables[i];
                const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim().toLowerCase());
                console.log(`Table ${i + 1} headers:`, headers);
                
                if (headers.includes("work item") || headers.includes("progress")) {
                    workItemsTable = table;
                    console.log(`Found work items table (Table ${i + 1})`);
                    break;
                }
            }
            
            if (!workItemsTable) {
                console.log("Work items table not found");
                return 0; // Return 0 if no table found
            }
            
            // Get all rows except the header
            const rows = Array.from(workItemsTable.querySelectorAll("tbody tr"));
            if (rows.length === 0) {
                console.log("No work items found in table");
                return 0; // Return 0 if no rows found
            }
            
            console.log(`Found ${rows.length} rows in work items table`);
            
            // Get the headers to find the column indices
            const headers = Array.from(workItemsTable.querySelectorAll("thead th")).map(th => th.textContent.trim().toLowerCase());
            console.log("Table headers:", headers);
            
            // Try to find budgeted quantity and earned quantity columns by header
            let budgetedQuantityIndex = -1;
            let earnedQuantityIndex = -1;
            
            headers.forEach((header, idx) => {
                const headerText = header.toLowerCase();
                if (headerText.includes("budgeted quantity")) {
                    budgetedQuantityIndex = idx;
                    console.log(`Found budgeted quantity column at index ${budgetedQuantityIndex}`);
                } else if (headerText.includes("earned quantity")) {
                    earnedQuantityIndex = idx;
                    console.log(`Found earned quantity column at index ${earnedQuantityIndex}`);
                }
            });
            
            // If we found quantity columns, use them
            if (budgetedQuantityIndex >= 0 && earnedQuantityIndex >= 0) {
                console.log("Using quantity columns for dashboard progress calculation");
                
                let totalBudgetedQuantity = 0;
                let totalEarnedQuantity = 0;
                
                // Process each row to find earned and budgeted quantities
                rows.forEach((row, index) => {
                    console.log(`Processing row ${index + 1} for quantities`);
                    const cells = row.querySelectorAll("td");
                    
                    let budgetedQuantity = 0;
                    let earnedQuantity = 0;
                    
                    if (budgetedQuantityIndex >= 0 && budgetedQuantityIndex < cells.length) {
                        const budgetedQuantityText = cells[budgetedQuantityIndex].textContent.trim().split(" ")[0]; // Remove units like "ea"
                        budgetedQuantity = parseFloat(budgetedQuantityText) || 0;
                        console.log(`Row ${index + 1} budgeted quantity: ${budgetedQuantity}`);
                    }
                    
                    if (earnedQuantityIndex >= 0 && earnedQuantityIndex < cells.length) {
                        const earnedQuantityText = cells[earnedQuantityIndex].textContent.trim().split(" ")[0]; // Remove units like "ea"
                        earnedQuantity = parseFloat(earnedQuantityText) || 0;
                        console.log(`Row ${index + 1} earned quantity: ${earnedQuantity}`);
                    }
                    
                    totalBudgetedQuantity += budgetedQuantity;
                    totalEarnedQuantity += earnedQuantity;
                });
                
                console.log(`Total Budgeted Quantity = ${totalBudgetedQuantity}, Total Earned Quantity = ${totalEarnedQuantity}`);
                
                // Calculate progress percentage
                if (totalBudgetedQuantity > 0) {
                    const progress = (totalEarnedQuantity / totalBudgetedQuantity) * 100;
                    console.log(`Calculated dashboard progress from quantities: ${progress.toFixed(2)}% (${totalEarnedQuantity}/${totalBudgetedQuantity})`);
                    return progress;
                }
            }
            
            // If we couldn"t find quantity columns, return 0
            // DO NOT FALL BACK TO PROGRESS COLUMN OR HOURS
            console.log("Quantity columns not found on dashboard table. Returning 0 progress. Project chart should aggregate from sub jobs.");
            return 0;
            
        } catch (error) {
            console.error("Error calculating dashboard progress:", error);
            return 0; // Return 0 on error
        }
    }
    
    // Helper function to calculate project progress
    function calculateProjectProgress() {
        try {
            console.log("Calculating project progress based on quantities");
            
            // First, try to get progress directly from the Overall Progress card
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
            
            // Next, try to calculate from earned and budgeted quantities in metrics cards
            const metricsGrid = document.querySelector(".metrics-grid");
            if (metricsGrid) {
                console.log("Found metrics grid on project page:", metricsGrid);
                
                const earnedQuantityCard = Array.from(metricsGrid.querySelectorAll(".metric-card")).find(card => {
                    return card.querySelector(".title")?.textContent.includes("Earned Quantity");
                });
                
                const budgetedQuantityCard = Array.from(metricsGrid.querySelectorAll(".metric-card")).find(card => {
                    return card.querySelector(".title")?.textContent.includes("Budgeted Quantity");
                });
                
                if (earnedQuantityCard && budgetedQuantityCard) {
                    console.log("Found earned and budgeted quantity cards");
                    
                    const earnedQuantityElement = earnedQuantityCard.querySelector(".value");
                    const budgetedQuantityElement = budgetedQuantityCard.querySelector(".value");
                    
                    if (earnedQuantityElement && budgetedQuantityElement) {
                        const earnedQuantityText = earnedQuantityElement.textContent.trim().split(" ")[0]; // Remove units
                        const budgetedQuantityText = budgetedQuantityElement.textContent.trim().split(" ")[0]; // Remove units
                        
                        console.log(`Earned Quantity Text: "${earnedQuantityText}", Budgeted Quantity Text: "${budgetedQuantityText}"`);
                        
                        const earnedQuantity = parseFloat(earnedQuantityText) || 0;
                        const budgetedQuantity = parseFloat(budgetedQuantityText) || 0;
                        
                        console.log(`Earned Quantity: ${earnedQuantity}, Budgeted Quantity: ${budgetedQuantity}`);
                        
                        if (budgetedQuantity > 0) {
                            const progress = (earnedQuantity / budgetedQuantity) * 100;
                            console.log(`Calculated project progress from quantity cards: ${progress.toFixed(2)}% (${earnedQuantity}/${budgetedQuantity})`);
                            return progress;
                        }
                    }
                }
            }
            
            // If we can"t find the quantity cards, try to navigate to sub job pages to get their quantities
            console.log("Looking for sub jobs table to get sub job IDs");
            const tables = document.querySelectorAll("table");
            let subJobsTable = null;
            
            // Find the table that looks like a sub jobs table
            for (let i = 0; i < tables.length; i++) {
                const table = tables[i];
                const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim().toLowerCase());
                console.log(`Table ${i + 1} headers:`, headers);
                
                if (headers.some(h => h.includes("sub job")) || headers.some(h => h.includes("id"))) {
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
                    return 0; // Return 0 if no rows found
                }
                
                console.log(`Found ${rows.length} rows in sub jobs table`);
                
                // Try to find the ID and Progress columns
                const headers = Array.from(subJobsTable.querySelectorAll("thead th")).map(th => th.textContent.trim().toLowerCase());
                const idIndex = headers.findIndex(h => h.includes("id"));
                const progressIndex = headers.findIndex(h => h.includes("progress"));
                
                if (progressIndex >= 0) {
                    console.log(`Found progress column at index ${progressIndex}`);
                    
                    let totalBudgetedHoursForWeighting = 0;
                    let weightedProgress = 0;
                    
                    // Process each row to get sub job progress
                    rows.forEach((row, index) => {
                        const cells = row.querySelectorAll("td");
                        
                        if (progressIndex < cells.length) {
                            const progressText = cells[progressIndex].textContent.trim().replace("%", "");
                            const progress = parseFloat(progressText) || 0;
                            
                            // For simplicity, we"ll use equal weights for all sub jobs
                            // In a real implementation, you might want to weight by budgeted hours or quantities
                            weightedProgress += progress;
                            totalBudgetedHoursForWeighting += 1;
                            
                            console.log(`Sub job ${index + 1} progress: ${progress}%`);
                        }
                    });
                    
                    if (totalBudgetedHoursForWeighting > 0) {
                        const avgProgress = weightedProgress / totalBudgetedHoursForWeighting;
                        console.log(`Calculated average project progress from sub jobs: ${avgProgress.toFixed(2)}%`);
                        return avgProgress;
                    }
                }
                
                // If we couldn"t get progress directly, try to find view links to navigate to sub job pages
                console.log("Looking for view links to navigate to sub job pages");
                
                // Check if there are any links in the Actions column
                const actionsIndex = headers.findIndex(h => h.includes("actions"));
                if (actionsIndex >= 0) {
                    console.log(`Found actions column at index ${actionsIndex}`);
                    
                    // Look for view links in each row
                    let subJobProgressValues = [];
                    
                    rows.forEach((row, index) => {
                        const cells = row.querySelectorAll("td");
                        if (actionsIndex < cells.length) {
                            const viewLink = cells[actionsIndex].querySelector("a[href*=\"/sub_job/\"]");
                            if (viewLink) {
                                const subJobUrl = viewLink.getAttribute("href");
                                console.log(`Found sub job link: ${subJobUrl}`);
                                
                                // Try to get the sub job ID from the URL
                                const subJobId = subJobUrl.split("/").pop();
                                if (subJobId) {
                                    console.log(`Sub job ID: ${subJobId}`);
                                    
                                    // Check if we have stored progress for this sub job in localStorage
                                    const storedProgress = localStorage.getItem(`subJob_${subJobId}_progress`);
                                    if (storedProgress) {
                                        const progress = parseFloat(storedProgress);
                                        console.log(`Found stored progress for sub job ${subJobId}: ${progress}%`);
                                        subJobProgressValues.push(progress);
                                    }
                                }
                            }
                        }
                    });
                    
                    // Calculate average progress from sub job progress values
                    if (subJobProgressValues.length > 0) {
                        const totalProgress = subJobProgressValues.reduce((sum, progress) => sum + progress, 0);
                        const avgProgress = totalProgress / subJobProgressValues.length;
                        console.log(`Calculated average project progress from stored sub job progress: ${avgProgress.toFixed(2)}%`);
                        return avgProgress;
                    }
                }
            }
            
            // If we still couldn"t calculate progress, try to get it from the sub job page directly
            // This is a last resort approach that requires the user to visit the sub job page first
            console.log("Trying to get progress from sub job page as last resort");
            
            // Check if we have any stored sub job progress in localStorage
            let storedSubJobProgress = null;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("subJob_") && key.endsWith("_progress")) {
                    const progress = parseFloat(localStorage.getItem(key));
                    if (!isNaN(progress)) {
                        console.log(`Found stored sub job progress: ${progress}%`);
                        storedSubJobProgress = progress;
                        break;
                    }
                }
            }
            
            if (storedSubJobProgress !== null) {
                console.log(`Using stored sub job progress: ${storedSubJobProgress}%`);
                return storedSubJobProgress;
            }
            
            // If we still couldn"t find a progress value, try to calculate from earned and budgeted hours
            console.log("Trying to calculate from earned and budgeted hours");
            
            const earnedHoursCard = Array.from(document.querySelectorAll(".metric-card")).find(card => {
                return card.querySelector(".title")?.textContent.includes("Earned Hours");
            });
            
            const budgetedHoursCard = Array.from(document.querySelectorAll(".metric-card")).find(card => {
                return card.querySelector(".title")?.textContent.includes("Budgeted Hours");
            });
            
            if (earnedHoursCard && budgetedHoursCard) {
                console.log("Found earned and budgeted hours cards");
                
                const earnedHoursElement = earnedHoursCard.querySelector(".value");
                const budgetedHoursElement = budgetedHoursCard.querySelector(".value");
                
                if (earnedHoursElement && budgetedHoursElement) {
                    const earnedHoursText = earnedHoursElement.textContent.trim();
                    const budgetedHoursText = budgetedHoursElement.textContent.trim();
                    
                    console.log(`Earned Hours Text: "${earnedHoursText}", Budgeted Hours Text: "${budgetedHoursText}"`);
                    
                    const earnedHours = parseFloat(earnedHoursText) || 0;
                    const budgetedHours = parseFloat(budgetedHoursText) || 0;
                    
                    console.log(`Earned Hours: ${earnedHours}, Budgeted Hours: ${budgetedHours}`);
                    
                    if (budgetedHours > 0) {
                        const progress = (earnedHours / budgetedHours) * 100;
                        console.log(`Calculated project progress from hours cards: ${progress.toFixed(2)}% (${earnedHours}/${budgetedHours})`);
                        return progress;
                    }
                }
            }
            
            // If we still couldn"t find a progress value, return 0
            console.log("Could not calculate project progress");
            return 0;
        } catch (error) {
            console.error("Error calculating project progress:", error);
            return 0; // Return 0 on error
        }
    }
    
    // Helper function to calculate sub job progress
    function calculateSubJobProgress() {
        try {
            console.log("Calculating sub job progress based on quantities");
            
            // Find the work items table
            const tables = document.querySelectorAll("table");
            let workItemsTable = null;
            
            // Find the table that looks like a work items table
            for (let i = 0; i < tables.length; i++) {
                const table = tables[i];
                const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim().toLowerCase());
                console.log(`Table ${i + 1} headers:`, headers);
                
                if (headers.includes("budgeted quantity") || headers.includes("earned quantity")) {
                    workItemsTable = table;
                    console.log(`Found work items table with quantity columns (Table ${i + 1})`);
                    break;
                } else if (headers.includes("work item") || headers.includes("progress")) {
                    workItemsTable = table;
                    console.log(`Found work items table (Table ${i + 1})`);
                    // Don"t break here, continue looking for a table with quantity columns
                }
            }
            
            if (!workItemsTable) {
                console.log("Work items table not found");
                return 0; // Return 0 if no table found
            }
            
            // Get all rows except the header
            const rows = Array.from(workItemsTable.querySelectorAll("tbody tr"));
            if (rows.length === 0) {
                console.log("No work items found in table");
                return 0; // Return 0 if no rows found
            }
            
            console.log(`Found ${rows.length} rows in work items table`);
            
            // Get the headers to find the column indices
            const headers = Array.from(workItemsTable.querySelectorAll("thead th")).map(th => th.textContent.trim().toLowerCase());
            console.log("Table headers:", headers);
            
            // Try to find budgeted quantity and earned quantity columns by header
            let budgetedQuantityIndex = -1;
            let earnedQuantityIndex = -1;
            
            headers.forEach((header, idx) => {
                const headerText = header.toLowerCase();
                if (headerText.includes("budgeted quantity")) {
                    budgetedQuantityIndex = idx;
                    console.log(`Found budgeted quantity column at index ${budgetedQuantityIndex}`);
                } else if (headerText.includes("earned quantity")) {
                    earnedQuantityIndex = idx;
                    console.log(`Found earned quantity column at index ${earnedQuantityIndex}`);
                }
            });
            
            // If we found quantity columns, use them
            if (budgetedQuantityIndex >= 0 && earnedQuantityIndex >= 0) {
                console.log("Using quantity columns for sub job progress calculation");
                
                let totalBudgetedQuantity = 0;
                let totalEarnedQuantity = 0;
                
                // Process each row to find earned and budgeted quantities
                rows.forEach((row, index) => {
                    console.log(`Processing row ${index + 1} for quantities`);
                    const cells = row.querySelectorAll("td");
                    
                    let budgetedQuantity = 0;
                    let earnedQuantity = 0;
                    
                    if (budgetedQuantityIndex >= 0 && budgetedQuantityIndex < cells.length) {
                        const budgetedQuantityText = cells[budgetedQuantityIndex].textContent.trim().split(" ")[0]; // Remove units like "ea"
                        budgetedQuantity = parseFloat(budgetedQuantityText) || 0;
                        console.log(`Row ${index + 1} budgeted quantity: ${budgetedQuantity}`);
                    }
                    
                    if (earnedQuantityIndex >= 0 && earnedQuantityIndex < cells.length) {
                        const earnedQuantityText = cells[earnedQuantityIndex].textContent.trim().split(" ")[0]; // Remove units like "ea"
                        earnedQuantity = parseFloat(earnedQuantityText) || 0;
                        console.log(`Row ${index + 1} earned quantity: ${earnedQuantity}`);
                    }
                    
                    totalBudgetedQuantity += budgetedQuantity;
                    totalEarnedQuantity += earnedQuantity;
                });
                
                console.log(`Total Budgeted Quantity = ${totalBudgetedQuantity}, Total Earned Quantity = ${totalEarnedQuantity}`);
                
                // Calculate progress percentage
                if (totalBudgetedQuantity > 0) {
                    const progress = (totalEarnedQuantity / totalBudgetedQuantity) * 100;
                    console.log(`Calculated sub job progress from quantities: ${progress.toFixed(2)}% (${totalEarnedQuantity}/${totalBudgetedQuantity})`);
                    
                    // Store the progress in localStorage for the project page to use
                    try {
                        // Try to get the sub job ID from the URL
                        const subJobId = window.location.pathname.split("/").pop();
                        if (subJobId) {
                            localStorage.setItem(`subJob_${subJobId}_progress`, progress.toString());
                            localStorage.setItem(`subJob_${subJobId}_progress_type`, "quantity");
                            console.log(`Stored sub job ${subJobId} progress in localStorage: ${progress}%`);
                        }
                    } catch (e) {
                        console.error("Error storing sub job progress in localStorage:", e);
                    }
                    
                    return progress;
                }
            }
            
            // If we couldn"t find quantity columns or they didn"t have valid data,
            // try to get progress directly from the Overall Progress card
            console.log("Quantity columns not found or invalid, trying to get progress from Overall Progress card");
            
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
            
            // If we couldn"t get progress from the card, try to calculate from budgeted hours and earned hours
            console.log("Progress card not found or invalid, trying to calculate from budgeted hours and earned hours");
            
            let budgetedHoursIndex = -1;
            let earnedHoursIndex = -1;
            
            headers.forEach((header, idx) => {
                const headerText = header.toLowerCase();
                if (headerText.includes("budgeted hours")) {
                    budgetedHoursIndex = idx;
                    console.log(`Found budgeted hours column at index ${budgetedHoursIndex}`);
                } else if (headerText.includes("earned hours")) {
                    earnedHoursIndex = idx;
                    console.log(`Found earned hours column at index ${earnedHoursIndex}`);
                }
            });
            
            if (budgetedHoursIndex >= 0 && earnedHoursIndex >= 0) {
                let totalBudgetedHours = 0;
                let totalEarnedHours = 0;
                
                // Process each row to find earned and budgeted hours
                rows.forEach((row, index) => {
                    console.log(`Processing row ${index + 1} for hours`);
                    const cells = row.querySelectorAll("td");
                    
                    let budgetedHours = 0;
                    let earnedHours = 0;
                    
                    if (budgetedHoursIndex >= 0 && budgetedHoursIndex < cells.length) {
                        const budgetedHoursText = cells[budgetedHoursIndex].textContent.trim();
                        budgetedHours = parseFloat(budgetedHoursText) || 0;
                        console.log(`Row ${index + 1} budgeted hours: ${budgetedHours}`);
                    }
                    
                    if (earnedHoursIndex >= 0 && earnedHoursIndex < cells.length) {
                        const earnedHoursText = cells[earnedHoursIndex].textContent.trim();
                        earnedHours = parseFloat(earnedHoursText) || 0;
                        console.log(`Row ${index + 1} earned hours: ${earnedHours}`);
                    }
                    
                    totalBudgetedHours += budgetedHours;
                    totalEarnedHours += earnedHours;
                });
                
                console.log(`Total Budgeted Hours = ${totalBudgetedHours}, Total Earned Hours = ${totalEarnedHours}`);
                
                // Calculate progress percentage
                if (totalBudgetedHours > 0) {
                    const progress = (totalEarnedHours / totalBudgetedHours) * 100;
                    console.log(`Calculated sub job progress from hours: ${progress.toFixed(2)}% (${totalEarnedHours}/${totalBudgetedHours})`);
                    return progress;
                }
            }
            
            // If we couldn"t calculate from hours either, try to get progress directly from the Progress column
            console.log("Could not calculate from hours, trying to get progress directly from Progress column");
            
            const progressIndex = headers.findIndex(h => h.includes("progress"));
            if (progressIndex >= 0) {
                console.log(`Found progress column at index ${progressIndex}`);
                
                let totalBudgetedHoursForWeighting = 0;
                let weightedProgress = 0;
                
                rows.forEach((row, index) => {
                    const cells = row.querySelectorAll("td");
                    if (progressIndex < cells.length && budgetedHoursIndex >= 0 && budgetedHoursIndex < cells.length) {
                        const progressText = cells[progressIndex].textContent.trim().replace("%", "");
                        const progress = parseFloat(progressText) || 0;
                        
                        const budgetedHoursText = cells[budgetedHoursIndex].textContent.trim();
                        const budgetedHours = parseFloat(budgetedHoursText) || 0;
                        
                        if (!isNaN(progress) && budgetedHours > 0) {
                            weightedProgress += progress * budgetedHours;
                            totalBudgetedHoursForWeighting += budgetedHours;
                            console.log(`Row ${index + 1} progress: ${progress}%, budgeted hours: ${budgetedHours}`);
                        }
                    }
                });
                
                if (totalBudgetedHoursForWeighting > 0) {
                    const avgProgress = weightedProgress / totalBudgetedHoursForWeighting;
                    console.log(`Calculated weighted average progress: ${avgProgress.toFixed(2)}%`);
                    return avgProgress;
                }
            }
            
            // If we still couldn"t calculate progress, return 0
            console.log("Could not calculate sub job progress");
            return 0;
        } catch (error) {
            console.error("Error calculating sub job progress:", error);
            return 0; // Return 0 on error
        }
    }
});
