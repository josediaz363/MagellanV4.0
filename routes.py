@main_bp.route('/')
def index():
    """Home page route with overall progress visualization"""
    try:
        # Get project_id from query parameters if specified
        project_id = request.args.get('project_id', type=int)
        
        if project_id:
            # If specific project is selected, only get that project
            projects = Project.query.filter_by(id=project_id).all()
            work_items = WorkItem.query.filter_by(project_id=project_id).order_by(WorkItem.id.desc()).limit(10).all()
        else:
            # Otherwise get all projects
            projects = Project.query.all()
            work_items = WorkItem.query.order_by(WorkItem.id.desc()).limit(10).all()
        
        # Calculate overall progress across all selected projects
        total_budgeted_hours = 0
        total_earned_hours = 0
        
        for project in projects:
            project_work_items = WorkItem.query.filter_by(project_id=project.id).all()
            for item in project_work_items:
                if item.budgeted_man_hours:
                    total_budgeted_hours += item.budgeted_man_hours
                if item.earned_man_hours:
                    total_earned_hours += item.earned_man_hours
        
        # Calculate overall progress percentage
        overall_progress = 0
        if total_budgeted_hours > 0:
            overall_progress = (total_earned_hours / total_budgeted_hours) * 100
            
        # Get all projects for the dropdown
        all_projects = Project.query.all()
            
        return render_template('index.html', 
                              projects=all_projects, 
                              work_items=work_items,
                              overall_progress=overall_progress)
    except Exception as e:
        flash(f'Error loading dashboard: {str(e)}', 'danger')
        traceback.print_exc()
        return render_template('index.html', projects=[], work_items=[], overall_progress=0)
