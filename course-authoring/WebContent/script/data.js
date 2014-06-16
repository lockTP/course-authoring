var data = {
  meta: {
    grp: "",
    usr: ""
  },
  
  courses: [
    {
      id: "1", institution: "PITT", name: "Introduction to Object-Oriented Programming", num: "IS1011", date: { year: "2014", term: "Spring" }, created: { by: "Julio Guerra", on: "2014-01-01" }, domainId: "java", isMy: false,
      units: [  // unitGetLst.php?course-id=1
        { id: "1", name: "Variables",             activityIds: { ex: ["1", "2", "3"], qz: ["4", "5", "6"] } },
        { id: "2", name: "Primitive Data Types",  activityIds: { ex: ["3", "2", "1"], qz: ["4", "5", "6"] } },
        { id: "3", name: "Constants",             activityIds: { ex: ["1"], qz: [] } },
        { id: "4", name: "Arithmetic Operations", activityIds: { ex: ["1", "2", "3", "4", "5", "6"], qz: [] } },
        { id: "5", name: "Strings",               activityIds: { ex: ["7", "8"], qz: [] } },
        { id: "6", name: "Boolean Expressions",   activityIds: { ex: ["9"], qz: [] } },
        { id: "7", name: "If-Else",               activityIds: { ex: ["10"], qz: [] } },
        { id: "8", name: "Switch",                activityIds: { ex: [], qz: ["10"] } },
        { id: "9", name: "Loops: For",            activityIds: { ex: [], qz: [] } }
      ],
      resources: [
        { id: "ex", name: "Examples", providerIds: ["we", "fi"] },
        { id: "qz", name: "Quizzes",   providerIds: ["qj"] },
      ]
    },
    
    {
      id: "2", institution: "PITT", name: "Introduction to Object-Oriented Programming",  num: "IS1011", date: { year: "2014", term: "Spring" }, created: { by: "Tomek Loboda", on: "2014-01-06" }, domainId: "java", isMy: true,
      units: [
        { id:  "1", name: "Loops: While",           activityIds: { ex: ["1"], qz: ["2"] } },
        { id:  "2", name: "Loops: Do-While",        activityIds: { ex: ["1"], qz: ["2"] } },
        { id:  "3", name: "Nested Loops",           activityIds: { ex: ["1"], qz: ["3"] } },
        { id:  "4", name: "Objects",                activityIds: { ex: [], qz: [] } },
        { id:  "5", name: "Classes",                activityIds: { ex: [], qz: [] } },
        { id:  "6", name: "Arrays",                 activityIds: { ex: [], qz: [] } },
        { id:  "7", name: "Two-dimensional Arrays", activityIds: { ex: [], qz: [] } },
        { id:  "8", name: "ArrayList",              activityIds: { ex: [], qz: [] } },
        { id:  "9", name: "Inheritance",            activityIds: { ex: [], qz: [] } },
        { id: "10", name: "Interfaces",             activityIds: { ex: [], qz: [] } }
      ],
      resources: [
        { id: "ex", name: "Examples", providerIds: ["we"]  },
        { id: "qz", name: "Quizzes",   providerIds: ["qj"]  },
      ]
    },
    
    {
      id: "3", institution: "PITT", name: "Database Management",  num: "IS2710", date: { year: "2015", term: "Spring" }, created: { by: "Vladimir Zadorozhny", on: "2015-01-01" }, domainId: "sql", isMy: false,
      units: [
        { id:  "1", name: "Select", activityIds: { ex: [] } },
        { id:  "2", name: "Insert", activityIds: { ex: [] } },
        { id:  "3", name: "Delete", activityIds: { ex: [] } }
      ],
      resources: [
        { id: "ex", name: "Queries", providerIds: ["sk"] }
      ]
    }
  ],
  
  activities: [
    { id:  "1", providerId: "qj", name: "Activity 1",  authorId: "1", url: "act.html", dim: { w: 300, h:160 }, tags: [ "java", "array", "for", "in" ] },
    { id:  "2", providerId: "qj", name: "Activity 2",  authorId: "1", url: "act.html",                         tags: [ "java", "while" ] },
    { id:  "3", providerId: "qj", name: "Activity 3",  authorId: "1", url: "act.html",                         tags: [ "java", "variable" ] },
    { id:  "4", providerId: "we", name: "Activity 4",  authorId: "1", url: "act.html",                         tags: [ "java" ] },
    { id:  "5", providerId: "we", name: "Activity 5",  authorId: "1", url: "act.html",                         tags: [ "java" ] },
    { id:  "6", providerId: "we", name: "Activity 6",  authorId: "2", url: "act.html",                         tags: [ "java" ] },
    { id:  "7", providerId: "fi", name: "Activity 7",  authorId: "2", url: "act.html",                         tags: [ "java" ] },
    { id:  "8", providerId: "sk", name: "Activity 8",  authorId: "2", url: "act.html",                         tags: [ "db" ] },
    { id:  "9", providerId: "sk", name: "Activity 9",  authorId: "3", url: "",                                 tags: [ "db" ] },
    { id: "10", providerId: "sk", name: "Activity 10", authorId: "4", url: "act.html",                         tags: [] }
  ],
  
  providers: [
    { id: "we", name: "WebEx" },
    { id: "fi", name: "FinEx" },
    { id: "qj", name: "QuizJet", url: "provider-quizjet.html" },
    { id: "sk", name: "SQL Knot" }
  ],
  
  authors: [
    { id: "1", name: "Paul Atreides" },
    { id: "2", name: "Vladimir Harkonnen" },
    { id: "3", name: "" }
  ],
  
  domains: [
    { id: "java", name: "Java" },
    { id: "sql",  name: "SQL" }
  ]
};