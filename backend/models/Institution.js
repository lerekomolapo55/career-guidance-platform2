class Institution {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.location = data.location;
    this.type = data.type;
    this.established = data.established;
    this.description = data.description;
    this.website = data.website;
    this.contact = data.contact;
    this.faculties = data.faculties || [];
    this.courses = data.courses || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      location: this.location,
      type: this.type,
      established: this.established,
      description: this.description,
      website: this.website,
      contact: this.contact,
      faculties: this.faculties,
      courses: this.courses,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  addFaculty(faculty) {
    this.faculties.push(faculty);
    this.updatedAt = new Date().toISOString();
  }

  addCourse(course) {
    this.courses.push(course);
    this.updatedAt = new Date().toISOString();
  }

  updateProfile(updates) {
    Object.keys(updates).forEach(key => {
      if (this[key] !== undefined) {
        this[key] = updates[key];
      }
    });
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Institution;