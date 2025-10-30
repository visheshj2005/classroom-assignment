import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Class from '../models/Class.js'
import Assignment from '../models/Assignment.js'
import Submission from '../models/Submission.js'
import Notification from '../models/Notification.js'
import Analytics from '../models/Analytics.js'

// Load environment variables
dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/classroom-assignment')
    console.log('MongoDB Connected for seeding')
  } catch (error) {
    console.error('Database connection error:', error)
    process.exit(1)
  }
}

const clearDatabase = async () => {
  try {
    await User.deleteMany({})
    await Class.deleteMany({})
    await Assignment.deleteMany({})
    await Submission.deleteMany({})
    await Notification.deleteMany({})
    await Analytics.deleteMany({})
    console.log('Database cleared')
  } catch (error) {
    console.error('Error clearing database:', error)
  }
}

const seedUsers = async () => {
  try {
    const users = [
      // Admin
      {
        name: 'System Administrator',
        email: 'admin@classroom.com',
        passwordHash: 'admin123',
        role: 'admin',
        profile: {
          bio: 'System administrator for the classroom portal',
          department: 'IT Administration'
        },
        isActive: true
      },
      // Teachers
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@classroom.com',
        passwordHash: 'teacher123',
        role: 'teacher',
        profile: {
          bio: 'Computer Science Professor with 10+ years of experience',
          department: 'Computer Science',
          phone: '+1-555-0101'
        },
        isActive: true
      },
      {
        name: 'Prof. Michael Chen',
        email: 'michael.chen@classroom.com',
        passwordHash: 'teacher123',
        role: 'teacher',
        profile: {
          bio: 'Mathematics Professor specializing in Calculus and Statistics',
          department: 'Mathematics',
          phone: '+1-555-0102'
        },
        isActive: true
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@classroom.com',
        passwordHash: 'teacher123',
        role: 'teacher',
        profile: {
          bio: 'Physics Professor with expertise in Quantum Mechanics',
          department: 'Physics',
          phone: '+1-555-0103'
        },
        isActive: true
      },
      // Students
      {
        name: 'Alice Smith',
        email: 'alice.smith@student.com',
        passwordHash: 'student123',
        role: 'student',
        profile: {
          bio: 'Computer Science major, junior year',
          department: 'Computer Science'
        },
        isActive: true
      },
      {
        name: 'Bob Wilson',
        email: 'bob.wilson@student.com',
        passwordHash: 'student123',
        role: 'student',
        profile: {
          bio: 'Mathematics major, sophomore year',
          department: 'Mathematics'
        },
        isActive: true
      },
      {
        name: 'Carol Davis',
        email: 'carol.davis@student.com',
        passwordHash: 'student123',
        role: 'student',
        profile: {
          bio: 'Physics major, senior year',
          department: 'Physics'
        },
        isActive: true
      },
      {
        name: 'David Brown',
        email: 'david.brown@student.com',
        passwordHash: 'student123',
        role: 'student',
        profile: {
          bio: 'Computer Science major, freshman year',
          department: 'Computer Science'
        },
        isActive: true
      },
      {
        name: 'Eva Martinez',
        email: 'eva.martinez@student.com',
        passwordHash: 'student123',
        role: 'student',
        profile: {
          bio: 'Mathematics major, junior year',
          department: 'Mathematics'
        },
        isActive: true
      },
      {
        name: 'Frank Thompson',
        email: 'frank.thompson@student.com',
        passwordHash: 'student123',
        role: 'student',
        profile: {
          bio: 'Physics major, sophomore year',
          department: 'Physics'
        },
        isActive: true
      }
    ]

    // Create users one by one to trigger pre-save middleware for password hashing
    const createdUsers = []
    for (const userData of users) {
      const user = new User(userData)
      await user.save() // This triggers the pre-save middleware
      createdUsers.push(user)
    }
    console.log(`Created ${createdUsers.length} users`)
    return createdUsers
  } catch (error) {
    console.error('Error seeding users:', error)
    return []
  }
}

const seedClasses = async (users) => {
  try {
    const teachers = users.filter(user => user.role === 'teacher')
    const students = users.filter(user => user.role === 'student')

    const classes = [
      {
        title: 'Introduction to Computer Science',
        description: 'Fundamental concepts of computer science including programming, algorithms, and data structures.',
        subject: 'Computer Science',
        teacherId: teachers[0]._id,
        joinCode: 'CS101A',
        students: [students[0]._id, students[3]._id, students[1]._id],
        settings: {
          allowLateSubmissions: true,
          autoGrading: false,
          maxFileSize: 10 * 1024 * 1024
        },
        createdBy: teachers[0]._id,
        isActive: true
      },
      {
        title: 'Advanced Algorithms',
        description: 'Deep dive into complex algorithms, optimization techniques, and computational complexity.',
        subject: 'Computer Science',
        teacherId: teachers[0]._id,
        joinCode: 'CS401A',
        students: [students[0]._id, students[3]._id],
        settings: {
          allowLateSubmissions: false,
          autoGrading: false,
          maxFileSize: 20 * 1024 * 1024
        },
        createdBy: teachers[0]._id,
        isActive: true
      },
      {
        title: 'Calculus I',
        description: 'Introduction to differential and integral calculus with applications.',
        subject: 'Mathematics',
        teacherId: teachers[1]._id,
        joinCode: 'MATH101',
        students: [students[1]._id, students[4]._id, students[2]._id],
        settings: {
          allowLateSubmissions: true,
          autoGrading: true,
          maxFileSize: 5 * 1024 * 1024
        },
        createdBy: teachers[1]._id,
        isActive: true
      },
      {
        title: 'Statistics and Probability',
        description: 'Statistical methods, probability theory, and data analysis techniques.',
        subject: 'Mathematics',
        teacherId: teachers[1]._id,
        joinCode: 'STAT201',
        students: [students[1]._id, students[4]._id, students[0]._id],
        settings: {
          allowLateSubmissions: true,
          autoGrading: false,
          maxFileSize: 15 * 1024 * 1024
        },
        createdBy: teachers[1]._id,
        isActive: true
      },
      {
        title: 'Quantum Physics',
        description: 'Introduction to quantum mechanics and its applications in modern physics.',
        subject: 'Physics',
        teacherId: teachers[2]._id,
        joinCode: 'PHYS301',
        students: [students[2]._id, students[5]._id],
        settings: {
          allowLateSubmissions: false,
          autoGrading: false,
          maxFileSize: 25 * 1024 * 1024
        },
        createdBy: teachers[2]._id,
        isActive: true
      },
      {
        title: 'Classical Mechanics',
        description: 'Fundamental principles of classical mechanics and their applications.',
        subject: 'Physics',
        teacherId: teachers[2]._id,
        joinCode: 'PHYS201',
        students: [students[2]._id, students[5]._id, students[4]._id],
        settings: {
          allowLateSubmissions: true,
          autoGrading: false,
          maxFileSize: 10 * 1024 * 1024
        },
        createdBy: teachers[2]._id,
        isActive: true
      }
    ]

    const createdClasses = await Class.insertMany(classes)
    console.log(`Created ${createdClasses.length} classes`)
    return createdClasses
  } catch (error) {
    console.error('Error seeding classes:', error)
    return []
  }
}

const seedAssignments = async (classes, teachers) => {
  try {
    const assignments = []

    // CS101A assignments
    assignments.push(
      {
        classId: classes[0]._id,
        title: 'Hello World Program',
        description: 'Write your first program that prints "Hello, World!" to the console.',
        instructions: 'Create a simple program in any programming language that outputs "Hello, World!". Include comments explaining your code.',
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxScore: 100,
        submissionType: 'both',
        allowedFileTypes: ['txt', 'py', 'java', 'cpp'],
        status: 'active',
        createdBy: teachers[0]._id
      },
      {
        classId: classes[0]._id,
        title: 'Basic Data Structures',
        description: 'Implement basic data structures: array, linked list, and stack.',
        instructions: 'Implement the three data structures with basic operations (insert, delete, search). Provide test cases for each implementation.',
        dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        maxScore: 150,
        submissionType: 'file',
        allowedFileTypes: ['py', 'java', 'cpp', 'zip'],
        status: 'active',
        createdBy: teachers[0]._id
      }
    )

    // CS401A assignments
    assignments.push(
      {
        classId: classes[1]._id,
        title: 'Dynamic Programming Solutions',
        description: 'Solve complex problems using dynamic programming techniques.',
        instructions: 'Implement solutions for the following problems: Longest Common Subsequence, Knapsack Problem, and Edit Distance. Analyze time and space complexity.',
        dueAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        maxScore: 200,
        submissionType: 'both',
        allowedFileTypes: ['py', 'java', 'cpp', 'pdf'],
        status: 'active',
        createdBy: teachers[0]._id
      }
    )

    // MATH101 assignments
    assignments.push(
      {
        classId: classes[2]._id,
        title: 'Derivative Calculations',
        description: 'Calculate derivatives of various functions using different rules.',
        instructions: 'Solve the given derivative problems using power rule, product rule, quotient rule, and chain rule. Show all work.',
        dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        maxScore: 100,
        submissionType: 'both',
        allowedFileTypes: ['pdf', 'jpg', 'png'],
        status: 'active',
        createdBy: teachers[1]._id
      },
      {
        classId: classes[2]._id,
        title: 'Integration Problems',
        description: 'Solve integration problems using various techniques.',
        instructions: 'Complete the integration worksheet using substitution, integration by parts, and partial fractions. Include graphs where appropriate.',
        dueAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        maxScore: 120,
        submissionType: 'file',
        allowedFileTypes: ['pdf', 'docx'],
        status: 'active',
        createdBy: teachers[1]._id
      }
    )

    // STAT201 assignments
    assignments.push(
      {
        classId: classes[3]._id,
        title: 'Statistical Analysis Project',
        description: 'Analyze a real-world dataset using statistical methods.',
        instructions: 'Choose a dataset, perform descriptive statistics, hypothesis testing, and create visualizations. Write a comprehensive report.',
        dueAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        maxScore: 200,
        submissionType: 'both',
        allowedFileTypes: ['pdf', 'docx', 'xlsx', 'py', 'r'],
        status: 'active',
        createdBy: teachers[1]._id
      }
    )

    // PHYS301 assignments
    assignments.push(
      {
        classId: classes[4]._id,
        title: 'Quantum Mechanics Problem Set',
        description: 'Solve quantum mechanics problems involving wave functions and operators.',
        instructions: 'Complete problems 1-10 from Chapter 3. Show detailed mathematical derivations and explain physical interpretations.',
        dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        maxScore: 150,
        submissionType: 'file',
        allowedFileTypes: ['pdf', 'tex'],
        status: 'active',
        createdBy: teachers[2]._id
      }
    )

    // PHYS201 assignments
    assignments.push(
      {
        classId: classes[5]._id,
        title: 'Projectile Motion Lab',
        description: 'Experimental analysis of projectile motion with data collection and analysis.',
        instructions: 'Conduct the projectile motion experiment, collect data, analyze results, and compare with theoretical predictions. Include error analysis.',
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxScore: 100,
        submissionType: 'both',
        allowedFileTypes: ['pdf', 'docx', 'xlsx'],
        status: 'active',
        createdBy: teachers[2]._id
      }
    )

    const createdAssignments = await Assignment.insertMany(assignments)
    console.log(`Created ${createdAssignments.length} assignments`)
    return createdAssignments
  } catch (error) {
    console.error('Error seeding assignments:', error)
    return []
  }
}

const seedSubmissions = async (assignments, students) => {
  try {
    const submissions = []

    // Create some sample submissions
    const sampleSubmissions = [
      {
        assignmentId: assignments[0]._id, // Hello World Program
        studentId: students[0]._id, // Alice Smith
        submissionType: 'file',
        content: {
          text: 'My first Hello World program in Python',
          files: [{
            filename: 'hello_world.py',
            originalName: 'hello_world.py',
            mimetype: 'text/x-python',
            size: 156,
            url: '/uploads/hello_world.py'
          }]
        },
        status: 'graded',
        grade: {
          score: 95,
          maxScore: 100,
          percentage: 95,
          letterGrade: 'A',
          feedback: 'Excellent work! Clean code with good comments.'
        },
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        assignmentId: assignments[0]._id, // Hello World Program
        studentId: students[3]._id, // David Brown
        submissionType: 'link',
        content: {
          url: 'https://github.com/davidbrown/hello-world',
          text: 'Here is my Hello World program repository'
        },
        status: 'graded',
        grade: {
          score: 88,
          maxScore: 100,
          percentage: 88,
          letterGrade: 'B+',
          feedback: 'Good work! Consider adding more detailed comments.'
        },
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        assignmentId: assignments[3]._id, // Derivative Calculations
        studentId: students[1]._id, // Bob Wilson
        submissionType: 'file',
        content: {
          text: 'Completed all derivative problems with detailed solutions',
          files: [{
            filename: 'derivatives_solutions.pdf',
            originalName: 'derivatives_solutions.pdf',
            mimetype: 'application/pdf',
            size: 2048576,
            url: '/uploads/derivatives_solutions.pdf'
          }]
        },
        status: 'graded',
        grade: {
          score: 92,
          maxScore: 100,
          percentage: 92,
          letterGrade: 'A-',
          feedback: 'Very good work! Minor error in problem 7, but overall excellent understanding.'
        },
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        assignmentId: assignments[1]._id, // Basic Data Structures
        studentId: students[0]._id, // Alice Smith
        submissionType: 'file',
        content: {
          text: 'Implementation of array, linked list, and stack with test cases',
          files: [{
            filename: 'data_structures.zip',
            originalName: 'data_structures.zip',
            mimetype: 'application/zip',
            size: 5242880,
            url: '/uploads/data_structures.zip'
          }]
        },
        status: 'submitted',
        submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      }
    ]

    const createdSubmissions = await Submission.insertMany(sampleSubmissions)
    console.log(`Created ${createdSubmissions.length} submissions`)
    return createdSubmissions
  } catch (error) {
    console.error('Error seeding submissions:', error)
    return []
  }
}

const seedNotifications = async (users, classes, assignments) => {
  try {
    const notifications = []
    const students = users.filter(user => user.role === 'student')
    const teachers = users.filter(user => user.role === 'teacher')

    // Sample notifications for students
    students.forEach(student => {
      notifications.push(
        {
          userId: student._id,
          type: 'assignment_created',
          title: 'New Assignment Posted',
          message: `New assignment "${assignments[0].title}" has been posted`,
          data: {
            assignmentId: assignments[0]._id,
            classId: assignments[0].classId,
            url: `/assignments/${assignments[0]._id}`
          },
          priority: 'medium',
          isRead: Math.random() > 0.5,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        },
        {
          userId: student._id,
          type: 'assignment_due_soon',
          title: 'Assignment Due Soon',
          message: `Assignment "${assignments[1].title}" is due in 2 days`,
          data: {
            assignmentId: assignments[1]._id,
            classId: assignments[1].classId,
            url: `/assignments/${assignments[1]._id}`
          },
          priority: 'high',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      )
    })

    // Sample notifications for teachers
    teachers.forEach(teacher => {
      notifications.push(
        {
          userId: teacher._id,
          type: 'submission_graded',
          title: 'New Submission Received',
          message: `New submission received for "${assignments[0].title}"`,
          data: {
            assignmentId: assignments[0]._id,
            classId: assignments[0].classId,
            url: `/assignments/${assignments[0]._id}/submissions`
          },
          priority: 'medium',
          isRead: Math.random() > 0.3,
          createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000)
        }
      )
    })

    const createdNotifications = await Notification.insertMany(notifications)
    console.log(`Created ${createdNotifications.length} notifications`)
    return createdNotifications
  } catch (error) {
    console.error('Error seeding notifications:', error)
    return []
  }
}

const seedAnalytics = async (users) => {
  try {
    const analytics = []
    const now = new Date()

    // Generate analytics data for the past 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]

      // Random user activities
      users.forEach(user => {
        // Login activities
        if (Math.random() > 0.3) {
          analytics.push({
            type: 'user_login',
            userId: user._id,
            metadata: {
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
              deviceType: ['desktop', 'tablet', 'mobile'][Math.floor(Math.random() * 3)]
            },
            timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
            date: dateStr,
            hour: Math.floor(Math.random() * 24)
          })
        }

        // Page views
        const pages = ['/dashboard', '/classes', '/assignments', '/profile', '/notifications']
        for (let j = 0; j < Math.floor(Math.random() * 5); j++) {
          analytics.push({
            type: 'page_view',
            userId: user._id,
            metadata: {
              path: pages[Math.floor(Math.random() * pages.length)],
              duration: Math.floor(Math.random() * 300000), // 0-5 minutes
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
            date: dateStr,
            hour: Math.floor(Math.random() * 24)
          })
        }
      })
    }

    const createdAnalytics = await Analytics.insertMany(analytics)
    console.log(`Created ${createdAnalytics.length} analytics records`)
    return createdAnalytics
  } catch (error) {
    console.error('Error seeding analytics:', error)
    return []
  }
}

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...')
    
    await connectDB()
    await clearDatabase()
    
    const users = await seedUsers()
    const teachers = users.filter(user => user.role === 'teacher')
    const students = users.filter(user => user.role === 'student')
    
    const classes = await seedClasses(users)
    const assignments = await seedAssignments(classes, teachers)
    const submissions = await seedSubmissions(assignments, students)
    const notifications = await seedNotifications(users, classes, assignments)
    const analytics = await seedAnalytics(users)
    
    console.log('\n=== Database Seeding Complete ===')
    console.log(`Users: ${users.length}`)
    console.log(`Classes: ${classes.length}`)
    console.log(`Assignments: ${assignments.length}`)
    console.log(`Submissions: ${submissions.length}`)
    console.log(`Notifications: ${notifications.length}`)
    console.log(`Analytics: ${analytics.length}`)
    
    console.log('\n=== Demo Login Credentials ===')
    console.log('Admin: admin@classroom.com / admin123')
    console.log('Teacher: sarah.johnson@classroom.com / teacher123')
    console.log('Student: alice.smith@student.com / student123')
    
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
}

export default seedDatabase