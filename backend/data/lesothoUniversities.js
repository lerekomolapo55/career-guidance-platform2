const lesothoUniversities = [
  {
    id: 1,
    name: "National University of Lesotho",
    location: "Roma, Maseru District",
    type: "public",
    established: "1945",
    students: "7000",
    website: "http://www.nul.ls",
    description: "The premier institution of higher learning in Lesotho, offering a wide range of undergraduate and postgraduate programs.",
    faculties: [
      "Faculty of Humanities",
      "Faculty of Science and Technology",
      "Faculty of Education",
      "Faculty of Health Sciences",
      "Faculty of Social Sciences",
      "Faculty of Agriculture",
      "Faculty of Law"
    ],
    contact: {
      phone: "+266 5221 4000",
      email: "info@nul.ls"
    },
    image: "nul"
  },
  {
    id: 2,
    name: "Limkokwing University of Creative Technology",
    location: "Maseru, Maseru District",
    type: "private",
    established: "2008",
    students: "3000",
    website: "http://www.limkokwing.net/ls",
    description: "An international university with a focus on creative technology, innovation, and entrepreneurship.",
    faculties: [
      "Faculty of Creative Technology",
      "Faculty of Business and Globalisation",
      "Faculty of Communication, Media and Broadcasting",
      "Faculty of Information Technology",
      "Faculty of Design Innovation"
    ],
    contact: {
      phone: "+266 2231 3755",
      email: "info@limkokwing.co.ls"
    },
    image: "limkokwing"
  },
  {
    id: 3,
    name: "Botho University",
    location: "Maseru, Maseru District",
    type: "private",
    established: "1997",
    students: "2500",
    website: "http://www.bothocollege.ac.ls",
    description: "A leading private university offering career-focused education in computing, business, and hospitality.",
    faculties: [
      "Faculty of Computing",
      "Faculty of Business and Accounting",
      "Faculty of Hospitality and Sustainable Tourism",
      "Faculty of Health and Education"
    ],
    contact: {
      phone: "+266 2231 2657",
      email: "info@bothocollege.ac.ls"
    },
    image: "botho"
  },
  {
    id: 4,
    name: "Lesotho College of Education",
    location: "Maseru, Maseru District",
    type: "public",
    established: "1975",
    students: "1500",
    website: "http://www.lce.ac.ls",
    description: "Specialized institution for teacher education and educational research.",
    faculties: [
      "Faculty of Primary Education",
      "Faculty of Secondary Education",
      "Faculty of Early Childhood Education",
      "Faculty of Special Needs Education"
    ],
    contact: {
      phone: "+266 2232 4201",
      email: "registrar@lce.ac.ls"
    },
    image: "lce"
  },
  {
    id: 5,
    name: "Lesotho Agricultural College",
    location: "Maseru, Maseru District",
    type: "public",
    established: "1955",
    students: "800",
    website: "http://www.agriculture.gov.ls",
    description: "Dedicated to agricultural education, research, and extension services.",
    faculties: [
      "Faculty of Crop Production",
      "Faculty of Animal Science",
      "Faculty of Agricultural Engineering",
      "Faculty of Agribusiness"
    ],
    contact: {
      phone: "+266 2232 0360",
      email: "principal@lac.edu.ls"
    },
    image: "lac"
  },
  {
    id: 6,
    name: "Lesotho Institute of Public Administration and Management",
    location: "Maseru, Maseru District",
    type: "public",
    established: "1978",
    students: "600",
    website: "http://www.lipam.org.ls",
    description: "Focused on public administration, management training, and capacity building.",
    faculties: [
      "Faculty of Public Administration",
      "Faculty of Management Studies",
      "Faculty of Leadership Development",
      "Faculty of Policy Studies"
    ],
    contact: {
      phone: "+266 2231 2746",
      email: "info@lipam.org.ls"
    },
    image: "lipam"
  },
  {
    id: 7,
    name: "Lesotho Nursing Council Training Institute",
    location: "Maseru, Maseru District",
    type: "public",
    established: "1980",
    students: "400",
    website: "http://www.lesothonursing.org.ls",
    description: "Specialized institution for nursing education and healthcare training.",
    faculties: [
      "Faculty of Nursing Sciences",
      "Faculty of Midwifery",
      "Faculty of Community Health",
      "Faculty of Healthcare Management"
    ],
    contact: {
      phone: "+266 2231 0567",
      email: "registrar@lnc.org.ls"
    },
    image: "lnc"
  },
  {
    id: 8,
    name: "Maseru Private Technical Institute",
    location: "Maseru, Maseru District",
    type: "private",
    established: "2005",
    students: "1200",
    website: "http://www.mpti.edu.ls",
    description: "Technical and vocational education institution offering practical skills training.",
    faculties: [
      "Faculty of Engineering Technology",
      "Faculty of Business Studies",
      "Faculty of Information Technology",
      "Faculty of Hospitality Management"
    ],
    contact: {
      phone: "+266 5250 1234",
      email: "admissions@mpti.edu.ls"
    },
    image: "mpti"
  },
  {
    id: 9,
    name: "Moyeni Teachers College",
    location: "Quthing, Quthing District",
    type: "public",
    established: "1982",
    students: "500",
    website: "http://www.moyenicollege.edu.ls",
    description: "Regional teacher training college serving southern Lesotho.",
    faculties: [
      "Faculty of Primary Education",
      "Faculty of Languages Education",
      "Faculty of Sciences Education",
      "Faculty of Social Sciences Education"
    ],
    contact: {
      phone: "+266 2276 0234",
      email: "principal@moyenicollege.edu.ls"
    },
    image: "moyeni"
  },
  {
    id: 10,
    name: "Lesotho Evangelical Church Teachers Training College",
    location: "Morija, Maseru District",
    type: "private",
    established: "1962",
    students: "350",
    website: "http://www.lecttc.edu.ls",
    description: "Church-affiliated institution providing quality teacher education.",
    faculties: [
      "Faculty of Christian Education",
      "Faculty of Primary Education",
      "Faculty of Early Childhood Development",
      "Faculty of Educational Leadership"
    ],
    contact: {
      phone: "+266 2236 0345",
      email: "admin@lecttc.edu.ls"
    },
    image: "lecttc"
  }
];

module.exports = lesothoUniversities;