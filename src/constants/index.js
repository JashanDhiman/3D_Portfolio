import {
    mobile,
    backend,
    creator,
    web,
    javascript,
    typescript,
    html,
    css,
    reactjs,
    redux,
    tailwind,
    nodejs,
    mongodb,
    git,
    figma,
    docker,
    meta,
    starbucks,
    tesla,
    shopify,
    carrent,
    jobit,
    tripguide,
    threejs,
    cueblocks,
    smartdata,
} from "../assets";

export const navLinks = [
    {
        id: "about",
        title: "About",
    },
    {
        id: "work",
        title: "Work",
    },
    {
        id: "contact",
        title: "Contact",
    },
];

const services = [
    {
        title: "Web Developer",
        icon: web,
    },
    {
      title: "Backend Developer",
      icon: backend,
    },
    {
      title: "Healthcare Platforms",
      icon: creator,
    },
    {
        title: "Shopify Custom Apps",
        icon: mobile,
    },
];

const technologies = [
    {
        name: "HTML 5",
        icon: html,
    },
    {
        name: "CSS 3",
        icon: css,
    },
    {
        name: "JavaScript",
        icon: javascript,
    },
    {
        name: "TypeScript",
        icon: typescript,
    },
    {
        name: "React JS",
        icon: reactjs,
    },
    {
        name: "Redux Toolkit",
        icon: redux,
    },
    {
        name: "Tailwind CSS",
        icon: tailwind,
    },
    {
        name: "Node JS",
        icon: nodejs,
    },
    {
        name: "MongoDB",
        icon: mongodb,
    },
    //{
    //    name: "Three JS",
    //    icon: threejs,
    //},
    {
        name: "git",
        icon: git,
    },
    {
        name: "figma",
        icon: figma,
    },
    {
        name: "shopify",
        icon: shopify,
    },
    //{
    //    name: "docker",
    //    icon: docker,
    //},
];

const experiences = [
    {
        title: "Web Developer",
        company_name: "Cue Blocks",
        icon: cueblocks,
        iconBg: "#383E56",
        date: "feb 2022 - sep 2022",
        points: [
            "Developing and maintaining web applications using React.js and other related technologies.",
            "Implementing responsive design and ensuring cross-browser compatibility.",
            "Together with my senior colleagues, I have successfully developed a customized Shopify app that aims to provide our customers with exceptional additional services and elevate their overall shopping experience.",
            "This app not only enhances existing projects but also offers a more productive, customized and efficient code to customer's Store.",
        ],
    },
    {
        title: "Full stack Developer",
        company_name: "SmartData",
        icon: smartdata,
        iconBg: "#383E56",
        date: "Jan 2023 - Present",
        points: [
            "Developing and maintaining Healthcare Platforms using React.js and nodeJS with taking-care of FHIR, HIPAA and PHI.",
            "Optimizing application for maximum speed and scalability.",
            "Developing Front-end with server-side logic.",
            "Collaborating with cross-functional teams including designers, project managers, and other developers to create high-quality Healthcare platforms.",
            "Participating in code reviews and providing constructive feedback to other developers.",
        ],
    },
    //{
    //    title: "React.js Developer",
    //    company_name: "Starbucks",
    //    icon: starbucks,
    //    iconBg: "#383E56",
    //    date: "March 2020 - April 2021",
    //    points: [
    //        "Developing and maintaining web applications using React.js and other related technologies.",
    //        "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
    //        "Implementing responsive design and ensuring cross-browser compatibility.",
    //        "Participating in code reviews and providing constructive feedback to other developers.",
    //    ],
    //},
    //{
    //    title: "React Native Developer",
    //    company_name: "Tesla",
    //    icon: tesla,
    //    iconBg: "#E6DEDD",
    //    date: "Jan 2021 - Feb 2022",
    //    points: [
    //        "Developing and maintaining web applications using React.js and other related technologies.",
    //        "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
    //        "Implementing responsive design and ensuring cross-browser compatibility.",
    //        "Participating in code reviews and providing constructive feedback to other developers.",
    //    ],
    //},
    //{
    //    title: "Web Developer",
    //    company_name: "Shopify",
    //    icon: shopify,
    //    iconBg: "#383E56",
    //    date: "Jan 2022 - Jan 2023",
    //    points: [
    //        "Developing and maintaining web applications using React.js and other related technologies.",
    //        "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
    //        "Implementing responsive design and ensuring cross-browser compatibility.",
    //        "Participating in code reviews and providing constructive feedback to other developers.",
    //    ],
    //},
    //{
    //    title: "Full stack Developer",
    //    company_name: "Meta",
    //    icon: meta,
    //    iconBg: "#E6DEDD",
    //    date: "Jan 2023 - Present",
    //    points: [
    //        "Developing and maintaining web applications using React.js and other related technologies.",
    //        "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
    //        "Implementing responsive design and ensuring cross-browser compatibility.",
    //        "Participating in code reviews and providing constructive feedback to other developers.",
    //    ],
    //},
];

const testimonials = [
    {
        testimonial:
            "He is a talented guy, and intially I thought this will be difficult but then gradually we were able to turn this sound applicaiton to reality. Thanks to Jashan for being patient and keep working with me for 2 years.",
        name: "Suneet Joshi",
        designation: "Founder",
        company: "NirvanaSage",
        image: "https://randomuser.me/api/portraits/women/4.jpg",
    },
    //{
    //    testimonial:
    //        "I've never met a web developer who truly cares about their clients' success like Jashan does.",
    //    name: "Chris Brown",
    //    designation: "COO",
    //    company: "DEF Corp",
    //    image: "https://randomuser.me/api/portraits/men/5.jpg",
    //},
    //{
    //    testimonial:
    //        "After Jashan optimized our website, our traffic increased by 50%. We can't thank them enough!",
    //    name: "Lisa Wang",
    //    designation: "CTO",
    //    company: "456 Enterprises",
    //    image: "https://randomuser.me/api/portraits/women/6.jpg",
    //},
];

const projects = [
    {
        name: "Chat Web App",
        description:
            "Web-based platform that allows users to login through google, create chat rooms, and chat with other users. Experience end-2-end encryption chating with us.",
        tags: [
            {
                name: "react",
                color: "blue-text-gradient",
            },
            {
                name: "firebase",
                color: "green-text-gradient",
            },
            {
                name: "tailwind",
                color: "pink-text-gradient",
            },
        ],
        image: carrent,
        link: "https://chat-web-app-36298.web.app/",
        source_code_link: "https://github.com/",
    },
    {
        name: "Memories timeline",
        description:
            "Web application that helps users to revisit the memories of past with a beautiful journey of sailing boat on the river. By uploading images, users can experience this timeline.",
        tags: [
            {
                name: "react",
                color: "blue-text-gradient",
            },
            {
                name: "restapi",
                color: "green-text-gradient",
            },
            {
                name: "gsap",
                color: "pink-text-gradient",
            },
        ],
        image: jobit,
        source_code_link: "https://github.com/JashanDhiman/memories-timeline",
    },
    {
        name: "Sound healer",
        description:
            "Web Application that helps users to improve there mental state, or chanalise the blocked area of brain via listening sounds, which are customised for each user specific.",
        tags: [
            {
                name: "react",
                color: "blue-text-gradient",
            },
            {
                name: "restapi",
                color: "green-text-gradient",
            },
            {
                name: "audioapi",
                color: "pink-text-gradient",
            },
        ],
        image: tripguide,
        source_code_link: null,
    },
];

export { services, technologies, experiences, testimonials, projects };