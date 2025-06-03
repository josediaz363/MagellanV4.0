/**
 * Magellan EV Tracker - Consolidated Donut Chart Visualization
 * Version: 1.37
 * 
 * This file adds donut chart visualizations to all three pages:
 * - Dashboard
 * - Project Overview
 * - Sub Job Overview
 * 
 * Each page gets its own donut chart showing the correct progress percentage
 * dynamically calculated from actual work item data.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Magellan EV Tracker - Initializing consolidated donut chart");
    
    // Determine which page we're on
    const currentPath = window.location.pathname;
    
    if (currentPath === '/' || currentPath.endsWith('/index')) {
        // Dashboard page
        console.log("Detected dashboard page, initializing dashboard chart");
        setTimeout(initializeDashboardChart, 500); // Longer delay to ensure DOM is ready
    } else if (currentPath.includes('/project/')) {
        // Project Overview page
        console.log("Detected project overview page, initializing project chart");
        setTimeout(initializeProjectChart, 500); // Longer delay to ensure DOM is ready
    } else if (currentPath.includes('/sub_job/')) {
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
            let metricsContainer = document.querySelector('.metrics-container');
            if (!metricsContainer) {
                metricsContainer = document.querySelector('.metrics-grid');
            }
            if (!metricsContainer) {
                // Try to find any container that might work
                metricsContainer = document.querySelector('.content > div');
            }
            
            if (!metricsContainer) {
                console.log("No suitable container found for dashboard chart");
                // Try to find the Project Dashboard heading as a fallback
                const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                const dashboardHeading = headings.find(h => h.textContent.includes('Project Dashboard'));
                if (dashboardHeading) {
                    metricsContainer = dashboardHeading.parentNode;
                } else {
                    // Last resort: use the main content div
                    metricsContainer = document.querySelector('.content');
                    if (!metricsContainer) {
                        console.error("Could not find any suitable container for dashboard chart");
                        return;
                    }
                }
            }
            
            console.log("Found container for dashboard chart:", metricsContainer);
            
            // Create chart container
            const chartContainer = document.createElement('div');
            chartContainer.id = 'dashboard-donut-chart-container';
            chartContainer.className = 'donut-chart-container';
            chartContainer.style.cssText = 'margin-bottom: 20px; text-align: center; position: relative;';
            
            // Insert the chart container before the metrics container
            metricsContainer.parentNode.insertBefore(chartContainer, metricsContainer);
            
            // Create title for the chart
            const title = document.createElement('h4');
            title.className = 'chart-title';
            title.textContent = 'Overall Progress';
            title.style.cssText = 'margin-bottom: 10px; font-size: 18px;';
            chartContainer.appendChild(title);
            
            // Create canvas for the chart
            const canvas = document.createElement('canvas');
            canvas.id = 'dashboardProgressChart';
            canvas.style.cssText = 'width: 100%; max-width: 200px; height: auto; margin: 0 auto;';
            chartContainer.appendChild(canvas);
            
            // Create center text container
            const centerText = document.createElement('div');
            centerText.className = 'chart-center-text';
            centerText.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;';
            chartContainer.appendChild(centerText);
            
            // Calculate progress from work items table
            let progressValue = calculateDashboardProgress();
            console.log(`Final dashboard progress value: ${progressValue}%`);
            
            // Create percentage display
            const percentage = document.createElement('span');
            percentage.className = 'progress-percentage';
            percentage.textContent = `${Math.round(progressValue)}%`;
            percentage.style.cssText = 'display: block; font-size: 24px; font-weight: bold;';
            centerText.appendChild(percentage);
            
            // Create label
            const label = document.createElement('span');
            label.className = 'progress-label';
            label.textContent = 'Complete';
            label.style.cssText = 'display: block; font-size: 14px;';
            centerText.appendChild(label);
            
            // Create or update the chart
            const ctx = canvas.getContext('2d');
            
            // Check if Chart is available
            if (typeof Chart === 'undefined') {
                console.error("Chart.js is not available");
                return;
            }
            
            // Create new chart
            try {
                window.dashboardProgressChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Complete', 'Remaining'],
                        datasets: [{
                            data: [progressValue, 100 - progressValue],
                            backgroundColor: ['#4CAF50', '#2c3034'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        cutout: '75%',
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.label + ': ' + context.raw + '%';
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
            let projectOverview = document.querySelector('.project-overview');
            if (!projectOverview) {
                // Try to find any container that might work
                const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                const projectHeading = headings.find(h => h.textContent.includes('Project Overview'));
                if (projectHeading) {
                    projectOverview = projectHeading.parentNode;
                } else {
                    // Last resort: use the main content div
                    projectOverview = document.querySelector('.content > div');
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
            let chartContainer = document.getElementById('project-donut-chart-container');
            if (!chartContainer) {
                chartContainer = document.createElement('div');
                chartContainer.id = 'project-donut-chart-container';
                chartContainer.className = 'donut-chart-container';
                chartContainer.style.cssText = 'margin-bottom: 20px; text-align: center; position: relative;';
                
                // Insert the chart container at the beginning of the project overview section
                projectOverview.insertBefore(chartContainer, projectOverview.firstChild);
            } else {
                // Clear existing content
                chartContainer.innerHTML = '';
            }
            
            // Create title for the chart
            const title = document.createElement('h4');
            title.className = 'chart-title';
            title.textContent = 'Overall Progress';
            title.style.cssText = 'margin-bottom: 10px; font-size: 18px;';
            chartContainer.appendChild(title);
            
            // Create canvas for the chart
            const canvas = document.createElement('canvas');
            canvas.id = 'projectProgressChart';
            canvas.style.cssText = 'width: 100%; max-width: 200px; height: auto; margin: 0 auto;';
            chartContainer.appendChild(canvas);
            
            // Create center text container
            const centerText = document.createElement('div');
            centerText.className = 'chart-center-text';
            centerText.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;';
            chartContainer.appendChild(centerText);
            
            // Create percentage display
            const percentage = document.createElement('span');
            percentage.className = 'progress-percentage';
            percentage.textContent = `${Math.round(progressValue)}%`;
            percentage.style.cssText = 'display: block; font-size: 24px; font-weight: bold;';
            centerText.appendChild(percentage);
            
            // Create label
            const label = document.createElement('span');
            label.className = 'progress-label';
            label.textContent = 'Complete';
            label.style.cssText = 'display: block; font-size: 14px;';
            centerText.appendChild(label);
            
            // Create or update the chart
            const ctx = canvas.getContext('2d');
            
            // Check if Chart is available
            if (typeof Chart === 'undefined') {
                console.error("Chart.js is not available");
                return;
            }
            
            // Create new chart
            try {
                window.projectProgressChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Complete', 'Remaining'],
                        datasets: [{
                            data: [progressValue, 100 - progressValue],
                            backgroundColor: ['#4CAF50', '#2c3034'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        cutout: '75%',
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.label + ': ' + context.raw + '%';
                                    }
                                }
                            }
                        }
                    }
                });
                console.log("Created project progress chart");
                
                // Update the progress value in any metrics cards
                const metricsGrid = document.querySelector('.metrics-grid');
                if (metricsGrid) {
                    const progressCards = Array.from(metricsGrid.querySelectorAll('.metric-card')).filter(card => {
                        return card.querySelector('.title')?.textContent.includes('Overall Progress');
                    });
                    
                    progressCards.forEach(card => {
                        const valueElement = card.querySelector('.value');
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
            const subJobOverview = document.querySelector('.sub-job-overview');
            if (!subJobOverview) {
                console.log("Sub job overview section not found, looking for alternative container");
                // Try to find an alternative container
                const contentDiv = document.querySelector('.content > div');
                if (!contentDiv) {
                    console.log("No suitable container found for sub job chart");
                    return;
                }
            }
            
            // Calculate progress from work items table
            let progressValue = calculateSubJobProgress();
            console.log(`Final sub job progress value: ${progressValue}%`);
            
            // Create chart container if it doesn't exist
            let chartContainer = document.getElementById('sub-job-donut-chart-container');
            if (!chartContainer) {
                chartContainer = document.createElement('div');
                chartContainer.id = 'sub-job-donut-chart-container';
                chartContainer.className = 'donut-chart-container';
                chartContainer.style.cssText = 'margin-bottom: 20px; text-align: center; position: relative;';
                
                // Find the best place to insert the chart
                if (subJobOverview) {
                    // Insert the chart container at the beginning of the sub job overview section
                    subJobOverview.insertBefore(chartContainer, subJobOverview.firstChild);
                } else {
                    // Try to find the metrics grid as a fallback
                    const metricsGrid = document.querySelector('.metrics-grid');
                    if (metricsGrid) {
                        metricsGrid.parentNode.insertBefore(chartContainer, metricsGrid);
                    } else {
                        // Last resort: insert at the beginning of the content div
                        const contentDiv = document.querySelector('.content > div');
                        if (contentDiv) {
                            contentDiv.insertBefore(chartContainer, contentDiv.firstChild);
                        }
                    }
                }
            } else {
                // Clear existing content
                chartContainer.innerHTML = '';
            }
            
            // Create title for the chart
            const title = document.createElement('h4');
            title.className = 'chart-title';
            title.textContent = 'Overall Progress';
            title.style.cssText = 'margin-bottom: 10px; font-size: 18px;';
            chartContainer.appendChild(title);
            
            // Create canvas for the chart
            const canvas = document.createElement('canvas');
            canvas.id = 'subJobProgressChart';
            canvas.style.cssText = 'width: 100%; max-width: 200px; height: auto; margin: 0 auto;';
            chartContainer.appendChild(canvas);
            
            // Create center text container
            const centerText = document.createElement('div');
            centerText.className = 'chart-center-text';
            centerText.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;';
            chartContainer.appendChild(centerText);
            
            // Create percentage display
            const percentage = document.createElement('span');
            percentage.className = 'progress-percentage';
            percentage.textContent = `${Math.round(progressValue)}%`;
            percentage.style.cssText = 'display: block; font-size: 24px; font-weight: bold;';
            centerText.appendChild(percentage);
            
            // Create label
            const label = document.createElement('span');
            label.className = 'progress-label';
            label.textContent = 'Complete';
            label.style.cssText = 'display: block; font-size: 14px;';
            centerText.appendChild(label);
            
            // Create or update the chart
            const ctx = canvas.getContext('2d');
            
            // Check if Chart is available
            if (typeof Chart === 'undefined') {
                console.error("Chart.js is not available");
                return;
            }
            
            // Create new chart
            try {
                window.subJobProgressChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Complete', 'Remaining'],
                        datasets: [{
                            data: [progressValue, 100 - progressValue],
                            backgroundColor: ['#4CAF50', '#2c3034'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        cutout: '75%',
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.label + ': ' + context.raw + '%';
                                    }
                                }
                            }
                        }
                    }
                });
                console.log("Created sub job progress chart");
                
                // Update the progress value in any metrics cards
                const metricsGrid = document.querySelector('.metrics-grid');
                if (metricsGrid) {
                    const progressCards = Array.from(metricsGrid.querySelectorAll('.metric-card')).filter(card => {
                        return card.querySelector('.title')?.textContent.includes('Overall Progress');
                    });
                    
                    progressCards.forEach(card => {
                        const valueElement = card.querySelector('.value');
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
            console.log("Calculating dashboard progress");
            
            // First, try to get progress directly from the progress column in the table
            const workItemsTable = document.querySelector('table');
            if (workItemsTable) {
                console.log("Found a table on dashboard:", workItemsTable);
                
                // Get all rows except the header
                const rows = Array.from(workItemsTable.querySelectorAll('tbody tr'));
                if (rows.length === 0) {
                    console.log("No rows found in table");
                    return 0; // Return 0 if no rows found
                }
                
                console.log(`Found ${rows.length} rows in table`);
                
                // First, try to find the progress column by header
                const headers = Array.from(workItemsTable.querySelectorAll('thead th'));
                let progressIndex = -1;
                
                headers.forEach((header, idx) => {
                    const headerText = header.textContent.trim().toLowerCase();
                    if (headerText.includes('progress')) {
                        progressIndex = idx;
                        console.log(`Found progress column at index ${progressIndex}`);
                    }
                });
                
                if (progressIndex >= 0) {
                    // We found a progress column, use it directly
                    let totalProgress = 0;
                    let rowCount = 0;
                    
                    rows.forEach((row, index) => {
                        const cells = row.querySelectorAll('td');
                        if (progressIndex < cells.length) {
                            const progressText = cells[progressIndex].textContent.trim().replace('%', '');
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
                
                // If we couldn't find a progress column or it didn't have valid data,
                // try to calculate from earned and budgeted hours
                let totalBudgetedHours = 0;
                let totalEarnedHours = 0;
                
                // Try to find budgeted hours and earned hours columns by header
                let budgetedIndex = -1;
                let earnedIndex = -1;
                
                headers.forEach((header, idx) => {
                    const headerText = header.textContent.trim().toLowerCase();
                    if (headerText.includes('budgeted hours')) {
                        budgetedIndex = idx;
                        console.log(`Found budgeted hours column at index ${budgetedIndex}`);
                    } else if (headerText.includes('earned hours')) {
                        earnedIndex = idx;
                        console.log(`Found earned hours column at index ${earnedIndex}`);
                    }
                });
                
                // If we couldn't find the columns by header, try common positions
                if (budgetedIndex < 0 || earnedIndex < 0) {
                    // Based on your screenshots, try these positions
                    if (headers.length >= 5) {
                        if (budgetedIndex < 0) {
                            budgetedIndex = 2; // Budgeted Hours is often the 3rd column
                            console.log(`Using fallback position for budgeted hours: column ${budgetedIndex + 1}`);
                        }
                        if (earnedIndex < 0) {
                            earnedIndex = 3; // Earned Hours is often the 4th column
                            console.log(`Using fallback position for earned hours: column ${earnedIndex + 1}`);
                        }
                    }
                }
                
                // Process each row to find earned and budgeted hours
                rows.forEach((row, index) => {
                    console.log(`Processing row ${index + 1} for hours`);
                    const cells = row.querySelectorAll('td');
                    
                    let budgetedHours = 0;
                    let earnedHours = 0;
                    
                    if (budgetedIndex >= 0 && budgetedIndex < cells.length) {
                        const budgetedHoursText = cells[budgetedIndex].textContent.trim();
                        budgetedHours = parseFloat(budgetedHoursText) || 0;
                        console.log(`Row ${index + 1} budgeted hours: ${budgetedHours}`);
                    }
                    
                    if (earnedIndex >= 0 && earnedIndex < cells.length) {
                        const earnedHoursText = cells[earnedIndex].textContent.trim();
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
                    console.log(`Calculated dashboard progress from hours: ${progress.toFixed(2)}% (${totalEarnedHours}/${totalBudgetedHours})`);
                    return progress;
                }
            }
            
            // If we couldn't calculate from the table, return 0
            console.log("Could not calculate dashboard progress");
            return 0;
        } catch (error) {
            console.error("Error calculating dashboard progress:", error);
            return 0; // Return 0 on error
        }
    }
    
    // Helper function to calculate project progress
    function calculateProjectProgress() {
        try {
            console.log("Calculating project progress");
            
            // First, try to get progress directly from the Overall Progress card
            const progressCards = document.querySelectorAll('.metric-card');
            for (let i = 0; i < progressCards.length; i++) {
                const card = progressCards[i];
                const title = card.querySelector('.title');
                if (title && title.textContent.trim().toLowerCase().includes('overall progress')) {
                    const valueElement = card.querySelector('.value');
                    if (valueElement) {
                        const progressText = valueElement.textContent.trim().replace('%', '');
                        const progress = parseFloat(progressText);
                        if (!isNaN(progress)) {
                            console.log(`Found progress directly from card: ${progress}%`);
                            return progress;
                        }
                    }
                }
            }
            
            // Next, try to calculate from earned and budgeted hours in metrics cards
            const metricsGrid = document.querySelector('.metrics-grid');
            if (metricsGrid) {
                console.log("Found metrics grid on project page:", metricsGrid);
                
                const earnedHoursCard = Array.from(metricsGrid.querySelectorAll('.metric-card')).find(card => {
                    return card.querySelector('.title')?.textContent.includes('Earned Hours');
                });
                
                const budgetedHoursCard = Array.from(metricsGrid.querySelectorAll('.metric-card')).find(card => {
                    return card.querySelector('.title')?.textContent.includes('Budgeted Hours');
                });
                
                if (earnedHoursCard && budgetedHoursCard) {
                    console.log("Found earned and budgeted hours cards");
                    
                    const earnedHoursElement = earnedHoursCard.querySelector('.value');
                    const budgetedHoursElement = budgetedHoursCard.querySelector('.value');
                    
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
            }
            
            // If we can't find the hours cards, try to calculate from the sub jobs table
            console.log("Looking for sub jobs table");
            const tables = document.querySelectorAll('table');
            let subJobsTable = null;
            
            // Find the table that looks like a sub jobs table
            for (let i = 0; i < tables.length; i++) {
                const table = tables[i];
                const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim().toLowerCase());
                console.log(`Table ${i + 1} headers:`, headers);
                
                if (headers.some(h => h.includes('progress')) || headers.some(h => h.includes('sub job'))) {
                    subJobsTable = table;
                    console.log(`Found sub jobs table (Table ${i + 1})`);
                    break;
                }
            }
            
            if (subJobsTable) {
                // Get all sub job rows except the header
                const rows = Array.from(subJobsTable.querySelectorAll('tbody tr'));
                if (rows.length === 0) {
                    console.log("No sub jobs found in table");
                    return 0; // Return 0 if no rows found
                }
                
                console.log(`Found ${rows.length} rows in sub jobs table`);
                
                let totalProgress = 0;
                let totalWeight = 0;
                
                // Process each row to calculate weighted average progress
                rows.forEach((row, index) => {
                    console.log(`Processing row ${index + 1}`);
                    const cells = row.querySelectorAll('td');
                    console.log(`Row has ${cells.length} cells`);
                    
                    // Log the content of each cell for debugging
                    cells.forEach((cell, cellIndex) => {
                        console.log(`Cell ${cellIndex + 1} content: "${cell.textContent.trim()}"`);
                    });
                    
                    if (cells.length >= 4) {
                        // Try to find progress column
                        let progressValue = 0;
                        
                        // Look for a cell that contains a percentage
                        for (let i = 0; i < cells.length; i++) {
                            const cellText = cells[i].textContent.trim();
                            if (cellText.endsWith('%')) {
                                const progressText = cellText.replace('%', '');
                                progressValue = parseFloat(progressText) || 0;
                                console.log(`Found progress in cell ${i + 1}: ${progressValue}%`);
                                break;
                            }
                        }
                        
                        // If we couldn't find a percentage, try the Progress column specifically
                        if (progressValue === 0) {
                            // Try to find the progress column by header
                            const headers = Array.from(subJobsTable.querySelectorAll('thead th'));
                            let progressIndex = -1;
                            
                            headers.forEach((header, idx) => {
                                if (header.textContent.trim().toLowerCase().includes('progress')) {
                                    progressIndex = idx;
                                    console.log(`Found progress column at index ${progressIndex}`);
                                }
                            });
                            
                            if (progressIndex >= 0 && progressIndex < cells.length) {
                                const progressText = cells[progressIndex].textContent.trim().replace('%', '');
                                progressValue = parseFloat(progressText) || 0;
                                console.log(`Progress from column ${progressIndex + 1}: ${progressValue}%`);
                            }
                        }
                        
                        // For simplicity, we'll use equal weights for all sub jobs
                        totalProgress += progressValue;
                        totalWeight += 1;
                        console.log(`Running total: ${totalProgress} / ${totalWeight}`);
                    }
                });
                
                // Calculate weighted average progress
                if (totalWeight > 0) {
                    const avgProgress = totalProgress / totalWeight;
                    console.log(`Calculated average project progress from sub jobs: ${avgProgress.toFixed(2)}%`);
                    return avgProgress;
                }
            }
            
            // If we still couldn't calculate progress, try to get it from the dashboard
            // This is a last resort approach
            console.log("Trying to get progress from dashboard as last resort");
            
            // Try to find any progress value on the page
            const progressElements = document.querySelectorAll('.progress, .progress-value, .value');
            for (let i = 0; i < progressElements.length; i++) {
                const element = progressElements[i];
                const text = element.textContent.trim();
                if (text.endsWith('%')) {
                    const progressValue = parseFloat(text.replace('%', '')) || 0;
                    if (progressValue > 0) {
                        console.log(`Found progress value on page: ${progressValue}%`);
                        return progressValue;
                    }
                }
            }
            
            // If we still couldn't find a progress value, return 0
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
            console.log("Calculating sub job progress");
            
            // First, try to get progress directly from the Overall Progress card
            const progressCards = document.querySelectorAll('.metric-card');
            for (let i = 0; i < progressCards.length; i++) {
                const card = progressCards[i];
                const title = card.querySelector('.title');
                if (title && title.textContent.trim().toLowerCase().includes('overall progress')) {
                    const valueElement = card.querySelector('.value');
                    if (valueElement) {
                        const progressText = valueElement.textContent.trim().replace('%', '');
                        const progress = parseFloat(progressText);
                        if (!isNaN(progress)) {
                            console.log(`Found progress directly from card: ${progress}%`);
                            return progress;
                        }
                    }
                }
            }
            
            // Next, try to calculate from earned and budgeted hours in metrics cards
            const metricsGrid = document.querySelector('.metrics-grid');
            if (metricsGrid) {
                console.log("Found metrics grid on sub job page:", metricsGrid);
                
                const earnedHoursCard = Array.from(metricsGrid.querySelectorAll('.metric-card')).find(card => {
                    return card.querySelector('.title')?.textContent.includes('Earned Hours');
                });
                
                const budgetedHoursCard = Array.from(metricsGrid.querySelectorAll('.metric-card')).find(card => {
                    return card.querySelector('.title')?.textContent.includes('Budgeted Hours');
                });
                
                if (earnedHoursCard && budgetedHoursCard) {
                    console.log("Found earned and budgeted hours cards");
                    
                    const earnedHoursElement = earnedHoursCard.querySelector('.value');
                    const budgetedHoursElement = budgetedHoursCard.querySelector('.value');
                    
                    if (earnedHoursElement && budgetedHoursElement) {
                        const earnedHoursText = earnedHoursElement.textContent.trim();
                        const budgetedHoursText = budgetedHoursElement.textContent.trim();
                        
                        console.log(`Earned Hours Text: "${earnedHoursText}", Budgeted Hours Text: "${budgetedHoursText}"`);
                        
                        const earnedHours = parseFloat(earnedHoursText) || 0;
                        const budgetedHours = parseFloat(budgetedHoursText) || 0;
                        
                        console.log(`Earned Hours: ${earnedHours}, Budgeted Hours: ${budgetedHours}`);
                        
                        if (budgetedHours > 0) {
                            const progress = (earnedHours / budgetedHours) * 100;
                            console.log(`Calculated sub job progress from hours cards: ${progress.toFixed(2)}% (${earnedHours}/${budgetedHours})`);
                            return progress;
                        }
                    }
                }
            }
            
            // If we can't find the hours cards, try to calculate from the work items table
            console.log("Looking for work items table");
            const tables = document.querySelectorAll('table');
            let workItemsTable = null;
            
            // Find the table that looks like a work items table
            for (let i = 0; i < tables.length; i++) {
                const table = tables[i];
                const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim().toLowerCase());
                console.log(`Table ${i + 1} headers:`, headers);
                
                if (headers.some(h => h.includes('work item')) || headers.some(h => h.includes('progress'))) {
                    workItemsTable = table;
                    console.log(`Found work items table (Table ${i + 1})`);
                    break;
                }
            }
            
            if (workItemsTable) {
                // Get all rows except the header
                const rows = Array.from(workItemsTable.querySelectorAll('tbody tr'));
                if (rows.length === 0) {
                    console.log("No work items found in table");
                    return 0; // Return 0 if no rows found
                }
                
                console.log(`Found ${rows.length} rows in work items table`);
                
                // First, try to get progress directly from the progress column
                const headers = Array.from(workItemsTable.querySelectorAll('thead th'));
                let progressIndex = -1;
                
                headers.forEach((header, idx) => {
                    if (header.textContent.trim().toLowerCase().includes('progress')) {
                        progressIndex = idx;
                        console.log(`Found progress column at index ${progressIndex}`);
                    }
                });
                
                if (progressIndex >= 0) {
                    // We found a progress column, use it directly
                    let totalProgress = 0;
                    let rowCount = 0;
                    
                    rows.forEach((row, index) => {
                        const cells = row.querySelectorAll('td');
                        if (progressIndex < cells.length) {
                            const progressText = cells[progressIndex].textContent.trim().replace('%', '');
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
                
                // If we couldn't get progress directly, try to calculate from earned and budgeted hours
                let totalBudgetedHours = 0;
                let totalEarnedHours = 0;
                
                // Try to find budgeted hours and earned hours columns by header
                let budgetedIndex = -1;
                let earnedIndex = -1;
                
                headers.forEach((header, idx) => {
                    const headerText = header.textContent.trim().toLowerCase();
                    if (headerText.includes('budgeted hours')) {
                        budgetedIndex = idx;
                        console.log(`Found budgeted hours column at index ${budgetedIndex}`);
                    } else if (headerText.includes('earned hours')) {
                        earnedIndex = idx;
                        console.log(`Found earned hours column at index ${earnedIndex}`);
                    }
                });
                
                // If we couldn't find the columns by header, try common positions
                if (budgetedIndex < 0 || earnedIndex < 0) {
                    // Based on your screenshots, try these positions
                    if (headers.length >= 6) {
                        if (budgetedIndex < 0) {
                            budgetedIndex = headers.length - 3; // Budgeted Hours is often the 3rd from last column
                            console.log(`Using fallback position for budgeted hours: column ${budgetedIndex + 1}`);
                        }
                        if (earnedIndex < 0) {
                            earnedIndex = headers.length - 2; // Earned Hours is often the 2nd from last column
                            console.log(`Using fallback position for earned hours: column ${earnedIndex + 1}`);
                        }
                    }
                }
                
                // Process each row
                rows.forEach((row, index) => {
                    console.log(`Processing row ${index + 1} for hours`);
                    const cells = row.querySelectorAll('td');
                    
                    let budgetedHours = 0;
                    let earnedHours = 0;
                    
                    if (budgetedIndex >= 0 && budgetedIndex < cells.length) {
                        const budgetedHoursText = cells[budgetedIndex].textContent.trim();
                        budgetedHours = parseFloat(budgetedHoursText) || 0;
                        console.log(`Row ${index + 1} budgeted hours: ${budgetedHours}`);
                    }
                    
                    if (earnedIndex >= 0 && earnedIndex < cells.length) {
                        const earnedHoursText = cells[earnedIndex].textContent.trim();
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
            
            // If we still couldn't calculate progress, return 0
            console.log("Could not calculate sub job progress");
            return 0;
        } catch (error) {
            console.error("Error calculating sub job progress:", error);
            return 0; // Return 0 on error
        }
    }
});
