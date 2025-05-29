document.addEventListener('DOMContentLoaded', () => {
    // Common elements
    const userForm = document.getElementById('userForm');
    const reportForm = document.getElementById('reportForm');
    const step1 = document.getElementById('step1');
    const citizenForm = document.getElementById('citizenForm');
    const thankYou = document.getElementById('thankYou');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const reportsContainer = document.getElementById('reportsContainer');
    
    // Initialize localStorage for submissions if it doesn't exist
    if (!localStorage.getItem('submissions')) {
        localStorage.setItem('submissions', JSON.stringify([
            {
                title: "Damaged Road on Sukhumvit",
                description: "Large pothole near Asok intersection causing traffic issues. Needs urgent repair.",
                files: ["road_damage.jpg", "location.txt"],
                timestamp: Date.now() - 86400000 * 2, // 2 days ago
                status: "new"
            },
            {
                title: "Illegal Dumping in Park",
                description: "Garbage being dumped nightly in Lumpini Park near south entrance.",
                files: ["dumping_1.jpg", "dumping_2.jpg"],
                timestamp: Date.now() - 86400000, // 1 day ago
                status: "in-progress"
            },
            {
                title: "Faulty Traffic Light",
                description: "Traffic light at Rama IV and Silom intersection not changing to green for Silom direction.",
                files: ["traffic_light.mp4"],
                timestamp: Date.now(),
                status: "resolved"
            }
        ]));
    }
    
    // Handle user type selection
    if (userForm) {
        userForm.addEventListener('submit', e => {
            e.preventDefault();
            const userType = document.querySelector('input[name="user"]:checked')?.value;
            
            if (userType === 'citizen') {
                step1.classList.add('hidden');
                citizenForm.classList.remove('hidden');
            } else if (userType === 'government') {
                if (localStorage.getItem('loggedIn') === 'true') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'login.html';
                }
            } else {
                alert('This option is not fully implemented yet.');
            }
        });
        
        // Add event listeners to radio options
        document.querySelectorAll('.radio-option').forEach(option => {
            option.addEventListener('click', function() {
                const radio = this.querySelector('input[type="radio"]');
                radio.checked = true;
                
                // Update styles
                document.querySelectorAll('.radio-option').forEach(el => {
                    el.style.borderColor = '#e1e8f0';
                    el.style.background = 'white';
                });
                
                this.style.borderColor = 'var(--primary)';
                this.style.background = 'rgba(255, 102, 204, 0.05)';
            });
        });
    }
    
    // Handle citizen report submission
    if (reportForm) {
        reportForm.addEventListener('submit', e => {
            e.preventDefault();
            
            // Get form data
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const files = Array.from(document.querySelector('input[type="file"]').files).map(file => file.name);
            
            // Save to localStorage
            const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
            submissions.push({
                title,
                description,
                files,
                timestamp: Date.now(),
                status: "new"
            });
            localStorage.setItem('submissions', JSON.stringify(submissions));
            
            // Show thank you message
            citizenForm.classList.add('hidden');
            thankYou.classList.remove('hidden');
            
            // Scroll to thank you message
            thankYou.scrollIntoView({ behavior: 'smooth' });
        });
        
        // File upload interaction
        const fileUpload = document.querySelector('.file-upload');
        const fileInput = document.querySelector('input[type="file"]');
        
        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.style.borderColor = 'var(--secondary)';
            fileUpload.style.background = 'rgba(66, 133, 244, 0.1)';
        });
        
        fileUpload.addEventListener('dragleave', () => {
            fileUpload.style.borderColor = '#e1e8f0';
            fileUpload.style.background = '#f9fbfd';
        });
        
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                fileUpload.innerHTML = `
                    <i class="fas fa-check-circle" style="color: var(--success)"></i>
                    <p>${this.files.length} file(s) selected</p>
                    <div class="text-center" style="margin-top: 15px;">
                        <button type="button" class="btn-pink" onclick="document.querySelector('input[type=file]').click()">
                            <i class="fas fa-sync-alt"></i> Change Files
                        </button>
                    </div>
                `;
            }
        });
    }
    
    // Handle login
    if (loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Hardcoded for demo: admin/admin
            if (username === 'admin' && password === 'admin') {
                localStorage.setItem('loggedIn', 'true');
                window.location.href = 'admin.html';
            } else {
                loginError.classList.remove('hidden');
            }
        });
    }
    
    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.setItem('loggedIn', 'false');
            window.location.href = 'index.html';
        });
    }
    
    // Populate admin reports
    if (reportsContainer) {
        renderReports();
        
        // Add event listeners for filtering
        if (searchInput) {
            searchInput.addEventListener('input', renderReports);
        }
        if (statusFilter) {
            statusFilter.addEventListener('change', renderReports);
        }
        if (dateFilter) {
            dateFilter.addEventListener('change', renderReports);
        }
    }
    
    // Check if user is logged in on admin page
    if (window.location.pathname.includes('admin.html')) {
        if (localStorage.getItem('loggedIn') !== 'true') {
            window.location.href = 'login.html';
        }
    }
    
    function renderReports() {
        reportsContainer.innerHTML = '';
        let submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        
        // Apply search filter
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            submissions = submissions.filter(sub => 
                sub.title.toLowerCase().includes(searchTerm) || 
                sub.description.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply status filter
        if (statusFilter && statusFilter.value !== 'all') {
            submissions = submissions.filter(sub => sub.status === statusFilter.value);
        }
        
        // Apply date filter
        if (dateFilter) {
            if (dateFilter.value === 'oldest') {
                submissions.sort((a, b) => a.timestamp - b.timestamp);
            } else {
                submissions.sort((a, b) => b.timestamp - a.timestamp);
            }
        }
        
        // Render reports
        submissions.forEach(sub => {
            const div = document.createElement('div');
            div.className = 'submission-box';
            
            // Get status badge
            let statusBadge = '';
            if (sub.status) {
                let statusText = '';
                if (sub.status === 'new') statusText = 'New';
                if (sub.status === 'in-progress') statusText = 'In Progress';
                if (sub.status === 'resolved') statusText = 'Resolved';
                
                statusBadge = `<span class="status-badge status-${sub.status}">${statusText}</span>`;
            }
            
            // Create file badges
            let fileBadges = '';
            if (sub.files && sub.files.length > 0) {
                fileBadges = '<div class="files">';
                sub.files.forEach(file => {
                    let icon = 'fa-file';
                    if (file.endsWith('.jpg') || file.endsWith('.png')) icon = 'fa-image';
                    if (file.endsWith('.mp4')) icon = 'fa-video';
                    if (file.endsWith('.txt')) icon = 'fa-file-alt';
                    
                    fileBadges += `<span class="file-badge"><i class="fas ${icon}"></i> ${file}</span>`;
                });
                fileBadges += '</div>';
            } else {
                fileBadges = '<p><strong>Files:</strong> None</p>';
            }
            
            div.innerHTML = `
                <h4>${sub.title} ${statusBadge}</h4>
                <p>${sub.description}</p>
                ${fileBadges}
                <div class="timestamp"><i class="far fa-clock"></i> Submitted: ${new Date(sub.timestamp).toLocaleString()}</div>
            `;
            reportsContainer.appendChild(div);
        });
        
        // Show message if no reports
        if (submissions.length === 0) {
            reportsContainer.innerHTML = `
                <div class="submission-box text-center">
                    <i class="fas fa-inbox" style="font-size: 48px; color: #718096; margin-bottom: 15px;"></i>
                    <h4>No reports found</h4>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
        }
    }
});

// Handling "Other" User Type
const otherForm = document.getElementById('otherForm');
const otherReportForm = document.getElementById('otherReportForm');

if (userForm) {
    userForm.addEventListener('submit', e => {
        e.preventDefault();
        const userType = document.querySelector('input[name="user"]:checked')?.value;

        if (userType === 'citizen') {
            step1.classList.add('hidden');
            citizenForm.classList.remove('hidden');
        } else if (userType === 'government') {
            if (localStorage.getItem('loggedIn') === 'true') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'login.html';
            }
        } else if (userType === 'other') {
            step1.classList.add('hidden');
            otherForm.classList.remove('hidden');
        } else {
            alert('Please select a valid option.');
        }
    });
}

if (otherReportForm) {
    otherReportForm.addEventListener('submit', e => {
        e.preventDefault();

        const reporterName = document.getElementById('reporterName').value;
        const address = document.getElementById('address').value;
        const position = document.getElementById('position').value;
        const title = document.getElementById('titleOther').value;
        const description = document.getElementById('descriptionOther').value;
        const files = Array.from(otherReportForm.querySelector('input[type="file"]').files).map(file => file.name);

        const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        submissions.push({
            reporterName,
            address,
            position,
            title,
            description,
            files,
            timestamp: Date.now(),
            status: "new",
            reportedBy: "organization"
        });
        localStorage.setItem('submissions', JSON.stringify(submissions));

        otherForm.classList.add('hidden');
        thankYou.classList.remove('hidden');
        thankYou.scrollIntoView({ behavior: 'smooth' });
    });
}


// Ensure navigation to reporting forms
if (window.location.pathname.includes('index.html')) {
    document.querySelector('.nav a[href="index.html"]').addEventListener('click', () => {
        step1.scrollIntoView({ behavior: 'smooth' });
    });
}
