/**
 * Magellan EV Tracker - Donut Chart Visualization
 * Version: 1.33
 * 
 * This file adds a non-invasive donut chart visualization to the dashboard
 * without modifying any existing workflow functionality.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only run on the dashboard page
    if (!document.querySelector('.metric-card')) {
        return;
    }
    
    // Create container for the donut chart
    const metricsContainer = document.querySelector('.metric-card').parentNode;
    const chartContainer = document.createElement('div');
    chartContainer.id = 'donut-chart-container';
    chartContainer.className = 'donut-chart-container';
    
    // Insert the chart container before the first metric card
    const firstMetricCard = document.querySelector('.metric-card');
    metricsContainer.insertBefore(chartContainer, firstMetricCard);
    
    // Create canvas for the chart
    const canvas = document.createElement('canvas');
    canvas.id = 'overallProgressChart';
    chartContainer.appendChild(canvas);
    
    // Create title for the chart
    const title = document.createElement('h4');
    title.className = 'chart-title';
    title.textContent = 'Overall Progress';
    chartContainer.insertBefore(title, canvas);
    
    // Create center text container
    const centerText = document.createElement('div');
    centerText.className = 'chart-center-text';
    chartContainer.appendChild(centerText);
    
    // Create percentage display
    const percentage = document.createElement('span');
    percentage.className = 'progress-percentage';
    percentage.textContent = '0%';
    centerText.appendChild(percentage);
    
    // Create label
    const label = document.createElement('span');
    label.className = 'progress-label';
    label.textContent = 'Complete';
    centerText.appendChild(label);
    
    // Calculate overall progress
    let overallProgress = 0;
    
    // Try to get project selector
    const projectSelector = document.querySelector('select');
    if (projectSelector) {
        // Add ID to the selector for easier reference
        projectSelector.id = 'projectSelector';
        
        // Add event listener for project selection
        projectSelector.addEventListener('change', function() {
            const projectId = this.value;
            if (projectId && projectId !== 'All Projects') {
                fetchProjectProgress(projectId);
            } else {
                fetchOverallProgress();
            }
        });
    }
    
    // Initial data fetch
    fetchOverallProgress();
    
    // Function to fetch overall progress data
    function fetchOverallProgress() {
        // Use AJAX to fetch data without modifying server routes
        fetch('/api/progress')
            .then(response => {
                if (!response.ok) {
                    // If API doesn't exist, calculate from DOM
                    calculateProgressFromDOM();
                    return null;
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    updateChart(data.progress);
                }
            })
            .catch(error => {
                console.log('Using fallback progress calculation');
                calculateProgressFromDOM();
            });
    }
    
    // Function to fetch project-specific progress
    function fetchProjectProgress(projectId) {
        fetch(`/api/progress/${projectId}`)
            .then(response => {
                if (!response.ok) {
                    // If API doesn't exist, calculate from DOM
                    calculateProgressFromDOM();
                    return null;
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    updateChart(data.progress);
                }
            })
            .catch(error => {
                console.log('Using fallback progress calculation');
                calculateProgressFromDOM();
            });
    }
    
    // Fallback function to calculate progress from DOM elements
    function calculateProgressFromDOM() {
        // Try to get progress from the first metric card (To Date Actual % Complete)
        const metricCards = document.querySelectorAll('.metric-card');
        if (metricCards.length > 0) {
            const firstCard = metricCards[0];
            const valueElement = firstCard.querySelector('.value');
            if (valueElement) {
                const progressText = valueElement.textContent;
                const progressValue = parseFloat(progressText);
                if (!isNaN(progressValue)) {
                    overallProgress = progressValue;
                    updateChart(overallProgress);
                    return;
                }
            }
        }
        
        // Alternative: try to get progress from the table
        const progressCells = document.querySelectorAll('td:nth-child(5)'); // Progress column
        if (progressCells.length > 0) {
            let totalProgress = 0;
            let count = 0;
            
            progressCells.forEach(cell => {
                const progressText = cell.textContent.trim();
                const progressValue = parseFloat(progressText);
                if (!isNaN(progressValue)) {
                    totalProgress += progressValue;
                    count++;
                }
            });
            
            if (count > 0) {
                overallProgress = totalProgress / count;
                updateChart(overallProgress);
                return;
            }
        }
        
        // Default to 0% if we can't find a value
        updateChart(0);
    }
    
    // Function to update the chart with new progress value
    function updateChart(progress) {
        // Update the center text
        const progressPercentage = document.querySelector('.progress-percentage');
        if (progressPercentage) {
            progressPercentage.textContent = `${Math.round(progress)}%`;
        }
        
        // Create or update the chart
        const ctx = document.getElementById('overallProgressChart').getContext('2d');
        
        // Check if chart already exists
        if (window.progressChart) {
            // Update existing chart
            window.progressChart.data.datasets[0].data = [progress, 100 - progress];
            window.progressChart.update();
        } else {
            // Create new chart
            window.progressChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Complete', 'Remaining'],
                    datasets: [{
                        data: [progress, 100 - progress],
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
        }
    }
});
