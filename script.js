const { createApp } = Vue;

createApp({
    data() {
        return {
            courses: [],
            team: []
        };
    },
    created() {
        this.fetchCourses();
        this.fetchTeam();
    },
    methods: {
        fetchCourses() {
            fetch('api.php?type=courses')
                .then(response => response.json())
                .then(data => {
                    this.courses = data;
                });
        },
        fetchTeam() {
            fetch('api.php?type=team')
                .then(response => response.json())
                .then(data => {
                    this.team = data;
                });
        }
    }
}).mount('#app');
