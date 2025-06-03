/**
 * Magellan EV Tracker - Sub Job Overview Donut Chart Visualization
 * Version: 1.33
 * 
 * This file adds a donut chart visualization to the Sub Job Overview page
 * showing overall progress of the sub job.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Magellan EV Tracker - Initializing sub job donut chart");
    
    // Only run on sub job view pages
    if (!window.location.href.includes('/sub_job/')) {
        return;
    }
    
    // Find the metrics container and the overall progress value
    const metricsGrid = document.querySelector('.metrics-grid');
    if (!metricsGrid) {
        console.log("Metrics grid not found on sub job page");
        return;
    }
    
    // Find the overall progress metric card
    const progressCard = Array.from(metricsGrid.querySelectorAll('.metric-card')).find(card => {
        return card.querySelector('.title')?.textContent.includes('Overall Progress');
    });
    
    if (!progressCard) {
        console.log("Progress card not found on sub job page");
        return;
    }
    
    // Get the current progress value
    const progressValueElement = progressCard.querySelector('.value');
    if (!progressValueElement) {
        console.log("Progress value element not found");
        return;
    }
    
    // Extract the progress percentage
    let progressText = progressValueElement.textContent.trim();
    let progressValue = parseFloat(progressText);
    if (isNaN(progressValue)) {
        progressValue = 0;
    }
    
    console.log(`Found sub job progress value: ${progressValue}%`);
    
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.id = 'sub-job-donut-chart-container';
    chartContainer.className = 'donut-chart-container';
    
    // Insert the chart container before the metrics grid
    metricsGrid.parentNode.insertBefore(chartContainer, metricsGrid);
    
    // Create title for the chart
    const title = document.createElement('h4');
    title.className = 'chart-title';
    title.textContent = 'Overall Progress';
    chartContainer.appendChild(title);
    
    // Create canvas for the chart
    const canvas = document.createElement('canvas');
    canvas.id = 'subJobProgressChart';
    canvas.style.cssText = 'width: 100%; height: auto;';
    chartContainer.appendChild(canvas);
    
    // Create center text container
    const centerText = document.createElement('div');
    centerText.className = 'chart-center-text';
    chartContainer.appendChild(centerText);
    
    // Create percentage display
    const percentage = document.createElement('span');
    percentage.className = 'progress-percentage';
    percentage.textContent = `${Math.round(progressValue)}%`;
    centerText.appendChild(percentage);
    
    // Create label
    const label = document.createElement('span');
    label.className = 'progress-label';
    label.textContent = 'Complete';
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
    } catch (error) {
        console.error("Error creating sub job progress chart:", error);
    }
    
    // Update the progress value in the metrics grid to match the chart
    // This ensures consistency between the chart and the text display
    progressValueElement.textContent = `${Math.round(progressValue)}%`;
});
