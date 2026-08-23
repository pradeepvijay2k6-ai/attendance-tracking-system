const fs = require('fs');

const ROSTER_IT_A = [
  { roll: '001', reg: '3122255002001', name: 'Aaditya B M' },
  { roll: '002', reg: '3122255002002', name: 'Adhiti Sudhakar' },
  { roll: '003', reg: '3122255002003', name: 'Adithya Kumaresan' },
  { roll: '004', reg: '3122255002004', name: 'Adithya M' },
  { roll: '005', reg: '3122255002005', name: 'Afsheen S' },
  { roll: '006', reg: '3122255002006', name: 'Agalya S' },
  { roll: '007', reg: '3122255002007', name: 'Ajay A' },
  { roll: '008', reg: '3122255002008', name: 'Akshaya R' },
  { roll: '009', reg: '3122255002009', name: 'Akshaya R' },
  { roll: '010', reg: '3122255002010', name: 'Alden B L' },
  { roll: '011', reg: '3122255002011', name: 'Anas Ahamed S' },
  { roll: '012', reg: '3122255002012', name: 'Anfara Shyma A' },
  { roll: '013', reg: '3122255002013', name: 'Anirudh Badri Narayanan' },
  { roll: '014', reg: '3122255002014', name: 'Aradhana P' },
  { roll: '015', reg: '3122255002015', name: 'Aravind S' },
  { roll: '016', reg: '3122255002016', name: 'Architha R' },
  { roll: '017', reg: '3122255002017', name: 'Arunachalam S' },
  { roll: '018', reg: '3122255002018', name: 'Arvindh Vijay G' },
  { roll: '019', reg: '3122255002019', name: 'Ashwin K B' },
  { roll: '020', reg: '3122255002020', name: 'Bavadharani S' },
  { roll: '021', reg: '3122255002021', name: 'Benita Mary Alwin' },
  { roll: '022', reg: '3122255002022', name: 'Charan V' },
  { roll: '023', reg: '3122255002023', name: 'Chris Bastian Roy' },
  { roll: '024', reg: '3122255002024', name: 'Dafna Delvis' },
  { roll: '025', reg: '3122255002025', name: 'Deepika Senthilnathan' },
  { roll: '026', reg: '3122255002026', name: 'Dhanvanth J M' },
  { roll: '027', reg: '3122255002027', name: 'Dharanidharan J' },
  { roll: '028', reg: '3122255002028', name: 'Dharshan R' },
  { roll: '029', reg: '3122255002029', name: 'Dharshan Sathish Kumar' },
  { roll: '030', reg: '3122255002030', name: 'Dharshini P K' },
  { roll: '031', reg: '3122255002031', name: 'Dhesh Sarvajith R' },
  { roll: '032', reg: '3122255002032', name: 'Divasundar S' },
  { roll: '033', reg: '3122255002033', name: 'Elamathi B' },
  { roll: '034', reg: '3122255002034', name: 'Eniya Sree K' },
  { roll: '035', reg: '3122255002035', name: 'Faizal I' },
  { roll: '036', reg: '3122255002036', name: 'Gokul Prasanth A' },
  { roll: '037', reg: '3122255002037', name: 'Gokula Hari Rajan R' },
  { roll: '038', reg: '3122255002038', name: 'Guru K' },
  { roll: '039', reg: '3122255002039', name: 'Guru Prasath N' },
  { roll: '040', reg: '3122255002040', name: 'Haridass C' },
  { roll: '041', reg: '3122255002041', name: 'Hariharan G' },
  { roll: '042', reg: '3122255002042', name: 'Harini Bharadwaj' },
  { roll: '043', reg: '3122255002043', name: 'Harini Devi B' },
  { roll: '044', reg: '3122255002044', name: 'Harini V' },
  { roll: '045', reg: '3122255002045', name: 'Harish S' },
  { roll: '046', reg: '3122255002046', name: 'Harishraam R' },
  { roll: '047', reg: '3122255002047', name: 'Harshini A' },
  { roll: '048', reg: '3122255002048', name: 'Harshini N T' },
  { roll: '049', reg: '3122255002049', name: 'Hemanya D' },
  { roll: '050', reg: '3122255002050', name: 'Hrishikesh G' },
  { roll: '051', reg: '3122255002051', name: 'Hubert Bala Joshwin D' },
  { roll: '052', reg: '3122255002052', name: 'Jeeva K' },
  { roll: '053', reg: '3122255002053', name: 'Kathir V' },
  { roll: '054', reg: '3122255002054', name: 'Kewinsanjai M' },
  { roll: '055', reg: '3122255002055', name: 'Kishore S B' },
  { roll: '056', reg: '3122255002056', name: 'Kruthika C D' },
  { roll: '057', reg: '3122255002057', name: 'Lakchitha A' },
  { roll: '058', reg: '3122255002058', name: 'Ligitha S' },
  { roll: '059', reg: '3122255002059', name: 'Madhu Mitha S' },
  { roll: '060', reg: '3122255002060', name: 'Madhuvarshini S' },
  { roll: '061', reg: '3122255002061', name: 'Madumika R P' },
  { roll: '062', reg: '3122255002062', name: 'Malavi V' },
  { roll: '063', reg: '3122255002063', name: 'Maria Rotric Loran L' },
  { roll: '064', reg: '3122255002064', name: 'Mathesh S' },
  { roll: '065', reg: '3122255002065', name: 'Menaga M' },
  { roll: '066', reg: '3122255002066', name: 'Mirthula S Fernando' },
  { roll: '067', reg: '3122255002067', name: 'Mithin Krishna P S' },
  { roll: '068', reg: '3122255002068', name: 'Mohamed Rafith A' },
  { roll: '069', reg: '3122255002069', name: 'Mohammed Aadhil J' },
  { roll: '070', reg: '3122255002070', name: 'Mohammed Noorul Islam V P' },
  { roll: '071', reg: '3122255002071', name: 'Mohana Prasath S' }
];

const ROSTER_IT_B = [
  { roll: '072', reg: '3122255002072', name: 'Mohith Priyan Balasubramanian' },
  { roll: '073', reg: '3122255002073', name: 'Mukesh K' },
  { roll: '074', reg: '3122255002074', name: 'Mukundhan K' },
  { roll: '075', reg: '3122255002075', name: 'Nagammai A' },
  { roll: '076', reg: '3122255002076', name: 'Namish Kadiyala' },
  { roll: '077', reg: '3122255002077', name: 'Nehaa M S' },
  { roll: '078', reg: '3122255002078', name: 'Nihitha S' },
  { roll: '079', reg: '3122255002079', name: 'Nikila G' },
  { roll: '080', reg: '3122255002080', name: 'Nishanth S' },
  { roll: '081', reg: '3122255002081', name: 'Nithilaa R' },
  { roll: '082', reg: '3122255002082', name: 'Nitinraj S' },
  { roll: '083', reg: '3122255002083', name: 'Parvathi P R' },
  { roll: '084', reg: '3122255002084', name: 'Pavithra S S M' },
  { roll: '085', reg: '3122255002085', name: 'Pradeep V' },
  { roll: '086', reg: '3122255002086', name: 'Pranaya Shree S' },
  { roll: '087', reg: '3122255002087', name: 'Preetha A' },
  { roll: '088', reg: '3122255002088', name: 'Prithivi S K' },
  { roll: '089', reg: '3122255002089', name: 'Priya V' },
  { roll: '090', reg: '3122255002090', name: 'Priyadharshni S' },
  { roll: '091', reg: '3122255002091', name: 'Rachel Jacob' },
  { roll: '092', reg: '3122255002092', name: 'Raghav Karthick' },
  { roll: '093', reg: '3122255002093', name: 'Ranjitha P' },
  { roll: '094', reg: '3122255002094', name: 'Ravivarman M' },
  { roll: '095', reg: '3122255002095', name: 'Renuka Varshini K' },
  { roll: '096', reg: '3122255002096', name: 'Ritheeshkumar S' },
  { roll: '097', reg: '3122255002097', name: 'Rithishsaran T K' },
  { roll: '098', reg: '3122255002098', name: 'Rohit Ram B' },
  { roll: '099', reg: '3122255002099', name: 'Rohit S' },
  { roll: '100', reg: '3122255002100', name: 'Rufhus Christopher R' },
  { roll: '101', reg: '3122255002101', name: 'Rupak K' },
  { roll: '102', reg: '3122255002102', name: 'Ruthvika V' },
  { roll: '103', reg: '3122255002103', name: 'Sachit Ram M' },
  { roll: '104', reg: '3122255002104', name: 'Sahana S' },
  { roll: '105', reg: '3122255002105', name: 'Saketh Ram Srinivasan' },
  { roll: '106', reg: '3122255002106', name: 'Sakthi V' },
  { roll: '107', reg: '3122255002107', name: 'Sanjay S' },
  { roll: '108', reg: '3122255002108', name: 'Santhosh P S' },
  { roll: '109', reg: '3122255002109', name: 'Sasikumar R' },
  { roll: '110', reg: '3122255002110', name: 'Shaahir Meeran Mohaideen M I' },
  { roll: '111', reg: '3122255002111', name: 'Shafrin Sahaana S' },
  { roll: '112', reg: '3122255002112', name: 'Shivani K S' },
  { roll: '113', reg: '3122255002113', name: 'Shivani V' },
  { roll: '114', reg: '3122255002114', name: 'Shravan Rao' },
  { roll: '115', reg: '3122255002115', name: 'Shreshta A' },
  { roll: '116', reg: '3122255002116', name: 'Shweta Mary John' },
  { roll: '117', reg: '3122255002117', name: 'Siva S' },
  { roll: '118', reg: '3122255002118', name: 'Sivaprabhu S' },
  { roll: '119', reg: '3122255002119', name: 'Soumiya S' },
  { roll: '120', reg: '3122255002120', name: 'Sri Dhanvanth P' },
  { roll: '121', reg: '3122255002121', name: 'Srinivetha V' },
  { roll: '122', reg: '3122255002122', name: 'Stefania E' },
  { roll: '123', reg: '3122255002123', name: 'Steve Winston G' },
  { roll: '124', reg: '3122255002124', name: 'Subha Shree R K' },
  { roll: '125', reg: '3122255002125', name: 'Subhasaravanan G' },
  { roll: '126', reg: '3122255002126', name: 'Sujeetha S' },
  { roll: '127', reg: '3122255002127', name: 'Sushil P' },
  { roll: '128', reg: '3122255002128', name: 'Susidharan S' },
  { roll: '129', reg: '3122255002129', name: 'Tarrun M' },
  { roll: '130', reg: '3122255002130', name: 'Tejaavarshini E' },
  { roll: '131', reg: '3122255002131', name: 'Tharika S' },
  { roll: '132', reg: '3122255002132', name: 'Thejesh J' },
  { roll: '133', reg: '3122255002133', name: 'Vaibhav Ramesh' },
  { roll: '134', reg: '3122255002134', name: 'Varshana M' },
  { roll: '135', reg: '3122255002135', name: 'Vidya Varuni R' },
  { roll: '136', reg: '3122255002136', name: 'Vignesh M' },
  { roll: '137', reg: '3122255002137', name: 'Vinu Shreshta Ganesan' },
  { roll: '138', reg: '3122255002138', name: 'Vishwa R' },
  { roll: '139', reg: '3122255002139', name: 'Yanush Jayakumar' },
  { roll: '140', reg: '3122255002140', name: 'Yashwanth A' },
  { roll: '141', reg: '3122255002141', name: 'Yazhini K' }
];

const TEACHERS = [
  { id: 't1', name: 'Dr. Arige Sumanth', code: 'ASU', email: 'ariges@ssn.edu.in', personalEmail: 'arigesumanth@gmail.com', dept: 'Information Technology', subjects: ['UIT3302 - Introduction to Digital Communication', 'UIT3363 - Digital Systems Practical'] },
  { id: 't2', name: 'Dr. V. Sivamurugan', code: 'VS', email: 'sivamuruganv@ssn.edu.in', dept: 'Information Technology', subjects: ['UIT3363 - Digital Systems and Microprocessors Design Theory'] },
  { id: 't3', name: 'Dr. S. I. Davis Presley', code: 'SDP', email: 'davispresleysi@ssn.edu.in', dept: 'Information Technology', subjects: ['UHS3386 - Universal Human Values 2: Understanding Harmony'] },
  { id: 't4', name: 'Dr. P. Jaish', code: 'PJ', email: 'jaishp@ssn.edu.in', dept: 'Mathematics', subjects: ['UMA3353 - Mathematical Foundations for Computing Technology (IT B)'] },
  { id: 't5', name: 'Dr. M. Mohamed Iqbal', code: 'MMI', email: 'mohamediqbalm@ssn.edu.in', dept: 'Information Technology', subjects: ['UIT3361 - Java (IT B)', 'UIT3311 - DB Lab (IT A)', 'UITV303 - Skill Dev (IT A)', 'UIT3362 - Software Eng (IT A)'] },
  { id: 't6', name: 'Dr. N. Kalaichelvi', code: 'NK', email: 'kalaichelvin@ssn.edu.in', dept: 'Information Technology', subjects: ['UIT3301 - Database Technology (IT A & IT B)', 'UIT3311 - DB Lab (IT B)', 'UITV303 - Skill Dev (IT B)'] },
  { id: 't7', name: 'Dr. G. Sornavalli', code: 'GS', email: 'sornavallig@ssn.edu.in', dept: 'Information Technology', subjects: ['UIT3362 - Principles of Software Engineering and Practices (IT B)'] },
  { id: 't8', name: 'Dr. H. Sabireen', code: 'HS', email: 'sabireenh@ssn.edu.in', dept: 'Information Technology', subjects: ['UIT3361 - Object-Oriented Programming Using Java (IT A)'] },
  { id: 't9', name: 'Dr. S. Vanitha', code: 'SV', email: 'vanithas@ssn.edu.in', dept: 'Mathematics', subjects: ['UMA3353 - Mathematical Foundations for Computing Technology (IT A)'] }
];

const SUBJECTS = [
  { code: 'UIT3302', name: 'Introduction to Digital Communication', dept: 'IT', sem: 3 },
  { code: 'UIT3363', name: 'Digital Systems and Microprocessors Design', dept: 'IT', sem: 3 },
  { code: 'UHS3386', name: 'Universal Human Values 2: Understanding Harmony', dept: 'IT', sem: 3 },
  { code: 'UMA3353', name: 'Mathematical Foundations for Computing Technology', dept: 'Math', sem: 3 },
  { code: 'UIT3361', name: 'Object-Oriented Programming Using Java', dept: 'IT', sem: 3 },
  { code: 'UIT3301', name: 'Database Technology', dept: 'IT', sem: 3 },
  { code: 'UIT3311', name: 'Database Technology Laboratory', dept: 'IT', sem: 3 },
  { code: 'UITV303', name: 'Skill Development Software - 1', dept: 'IT', sem: 3 },
  { code: 'UIT3362', name: 'Principles of Software Engineering and Practices', dept: 'IT', sem: 3 }
];

const TIMETABLE = [
  // IT A (EH 5)
  { id: 'ita_1', section: 'IT A', venue: 'EH 5', day: 1, dayName: 'Mon', p: 1, time: '08:00 - 08:45', subCode: 'UIT3361', subName: 'Object-Oriented Programming Using Java', teacherId: 't8', teacherName: 'Dr. H. Sabireen' },
  { id: 'ita_2', section: 'IT A', venue: 'EH 5', day: 1, dayName: 'Mon', p: 2, time: '08:45 - 09:30', subCode: 'UIT3301', subName: 'Database Technology', teacherId: 't6', teacherName: 'Dr. N. Kalaichelvi' },
  { id: 'ita_3', section: 'IT A', venue: 'EH 5', day: 1, dayName: 'Mon', p: 5, time: '12:20 - 13:05', subCode: 'UIT3362', subName: 'Principles of Software Engineering and Practices', teacherId: 't5', teacherName: 'Dr. M. Mohamed Iqbal' },
  { id: 'ita_4', section: 'IT A', venue: 'EH 5', day: 2, dayName: 'Tue', p: 1, time: '08:00 - 08:45', subCode: 'UMA3353', subName: 'Mathematical Foundations for Computing Technology', teacherId: 't9', teacherName: 'Dr. S. Vanitha' },
  { id: 'ita_5', section: 'IT A', venue: 'EH 5', day: 2, dayName: 'Tue', p: 2, time: '08:45 - 09:30', subCode: 'UIT3363', subName: 'Digital Systems and Microprocessors Design', teacherId: 't2', teacherName: 'Dr. V. Sivamurugan' },
  { id: 'ita_6', section: 'IT A', venue: 'EH 5', day: 2, dayName: 'Tue', p: 3, time: '09:50 - 10:35', subCode: 'UIT3361', subName: 'Object-Oriented Programming Using Java', teacherId: 't8', teacherName: 'Dr. H. Sabireen' },
  { id: 'ita_7', section: 'IT A', venue: 'EH 5', day: 2, dayName: 'Tue', p: 4, time: '10:35 - 11:20', subCode: 'UIT3301', subName: 'Database Technology', teacherId: 't6', teacherName: 'Dr. N. Kalaichelvi' },
  { id: 'ita_8', section: 'IT A', venue: 'EH 5', day: 2, dayName: 'Tue', p: 5, time: '12:20 - 13:05', subCode: 'UIT3302', subName: 'Introduction to Digital Communication', teacherId: 't1', teacherName: 'Dr. Arige Sumanth' },
  { id: 'ita_9', section: 'IT A', venue: 'EH 5', day: 2, dayName: 'Tue', p: 6, time: '13:05 - 13:50', subCode: 'UHS3386', subName: 'Universal Human Values 2: Understanding Harmony', teacherId: 't3', teacherName: 'Dr. S. I. Davis Presley' },
  { id: 'ita_10', section: 'IT A', venue: 'EH 5', day: 2, dayName: 'Tue', p: 7, time: '14:10 - 14:55', subCode: 'UHS3386', subName: 'Universal Human Values 2: Understanding Harmony', teacherId: 't3', teacherName: 'Dr. S. I. Davis Presley' },
  { id: 'ita_11', section: 'IT A', venue: 'EH 5', day: 3, dayName: 'Wed', p: 7, time: '14:10 - 14:55', subCode: 'UITV303', subName: 'Skill Development Software - 1', teacherId: 't5', teacherName: 'Dr. M. Mohamed Iqbal' },
  { id: 'ita_12', section: 'IT A', venue: 'EH 5', day: 3, dayName: 'Wed', p: 8, time: '14:55 - 15:40', subCode: 'UMA3353', subName: 'Mathematical Foundations for Computing Technology', teacherId: 't9', teacherName: 'Dr. S. Vanitha' },
  { id: 'ita_13', section: 'IT A', venue: 'EH 5', day: 4, dayName: 'Thu', p: 1, time: '08:00 - 08:45', subCode: 'UIT3362', subName: 'Principles of Software Engineering and Practices', teacherId: 't5', teacherName: 'Dr. M. Mohamed Iqbal' },
  { id: 'ita_14', section: 'IT A', venue: 'EH 5', day: 4, dayName: 'Thu', p: 2, time: '08:45 - 09:30', subCode: 'UIT3302', subName: 'Introduction to Digital Communication', teacherId: 't1', teacherName: 'Dr. Arige Sumanth' },
  { id: 'ita_15', section: 'IT A', venue: 'EH 5', day: 4, dayName: 'Thu', p: 3, time: '09:50 - 10:35', subCode: 'UIT3363', subName: 'Digital Systems and Microprocessors Design', teacherId: 't2', teacherName: 'Dr. V. Sivamurugan' },
  { id: 'ita_16', section: 'IT A', venue: 'EH 5', day: 4, dayName: 'Thu', p: 4, time: '10:35 - 11:20', subCode: 'UHS3386', subName: 'Universal Human Values 2: Understanding Harmony', teacherId: 't3', teacherName: 'Dr. S. I. Davis Presley' },
  { id: 'ita_17', section: 'IT A', venue: 'EH 5', day: 4, dayName: 'Thu', p: 5, time: '12:20 - 13:05', subCode: 'UMA3353', subName: 'Mathematical Foundations for Computing Technology', teacherId: 't9', teacherName: 'Dr. S. Vanitha' },
  { id: 'ita_18', section: 'IT A', venue: 'EH 5', day: 5, dayName: 'Fri', p: 1, time: '08:00 - 08:45', subCode: 'UIT3363', subName: 'Digital Systems and Microprocessors Design', teacherId: 't2', teacherName: 'Dr. V. Sivamurugan' },
  { id: 'ita_19', section: 'IT A', venue: 'EH 5', day: 5, dayName: 'Fri', p: 2, time: '08:45 - 09:30', subCode: 'UIT3302', subName: 'Introduction to Digital Communication', teacherId: 't1', teacherName: 'Dr. Arige Sumanth' },
  { id: 'ita_20', section: 'IT A', venue: 'EH 5', day: 5, dayName: 'Fri', p: 3, time: '09:50 - 10:35', subCode: 'UIT3301', subName: 'Database Technology', teacherId: 't6', teacherName: 'Dr. N. Kalaichelvi' },
  { id: 'ita_21', section: 'IT A', venue: 'EH 5', day: 5, dayName: 'Fri', p: 4, time: '10:35 - 11:20', subCode: 'UHS3386', subName: 'Universal Human Values 2: Understanding Harmony', teacherId: 't3', teacherName: 'Dr. S. I. Davis Presley' },
  { id: 'ita_22', section: 'IT A', venue: 'EH 5', day: 5, dayName: 'Fri', p: 5, time: '12:20 - 13:05', subCode: 'UMA3353', subName: 'Mathematical Foundations for Computing Technology', teacherId: 't9', teacherName: 'Dr. S. Vanitha' },

  // IT B (EH 6)
  { id: 'itb_1', section: 'IT B', venue: 'EH 6', day: 1, dayName: 'Mon', p: 1, time: '08:00 - 08:45', subCode: 'UIT3302', subName: 'Introduction to Digital Communication', teacherId: 't1', teacherName: 'Dr. Arige Sumanth' },
  { id: 'itb_2', section: 'IT B', venue: 'EH 6', day: 1, dayName: 'Mon', p: 2, time: '08:45 - 09:30', subCode: 'UIT3363', subName: 'Digital Systems and Microprocessors Design', teacherId: 't2', teacherName: 'Dr. V. Sivamurugan' },
  { id: 'itb_3', section: 'IT B', venue: 'EH 6', day: 1, dayName: 'Mon', p: 3, time: '09:50 - 10:35', subCode: 'UHS3386', subName: 'Universal Human Values 2: Understanding Harmony', teacherId: 't3', teacherName: 'Dr. S. I. Davis Presley' },
  { id: 'itb_4', section: 'IT B', venue: 'EH 6', day: 1, dayName: 'Mon', p: 4, time: '10:35 - 11:20', subCode: 'UMA3353', subName: 'Mathematical Foundations for Computing Technology', teacherId: 't4', teacherName: 'Dr. P. Jaish' },
  { id: 'itb_5', section: 'IT B', venue: 'EH 6', day: 1, dayName: 'Mon', p: 5, time: '12:20 - 13:05', subCode: 'UIT3301', subName: 'Database Technology', teacherId: 't6', teacherName: 'Dr. N. Kalaichelvi' },
  { id: 'itb_6', section: 'IT B', venue: 'EH 6', day: 1, dayName: 'Mon', p: 6, time: '13:05 - 13:50', subCode: 'UHS3386', subName: 'Universal Human Values 2: Understanding Harmony', teacherId: 't3', teacherName: 'Dr. S. I. Davis Presley' },
  { id: 'itb_7', section: 'IT B', venue: 'EH 6', day: 1, dayName: 'Mon', p: 7, time: '14:10 - 14:55', subCode: 'UHS3386', subName: 'Universal Human Values 2: Understanding Harmony', teacherId: 't3', teacherName: 'Dr. S. I. Davis Presley' },
  { id: 'itb_8', section: 'IT B', venue: 'EH 6', day: 2, dayName: 'Tue', p: 3, time: '09:50 - 10:35', subCode: 'UIT3302', subName: 'Introduction to Digital Communication', teacherId: 't1', teacherName: 'Dr. Arige Sumanth' },
  { id: 'itb_9', section: 'IT B', venue: 'EH 6', day: 2, dayName: 'Tue', p: 4, time: '10:35 - 11:20', subCode: 'UMA3353', subName: 'Mathematical Foundations for Computing Technology', teacherId: 't4', teacherName: 'Dr. P. Jaish' },
  { id: 'itb_10', section: 'IT B', venue: 'EH 6', day: 2, dayName: 'Tue', p: 5, time: '12:20 - 13:05', subCode: 'UIT3363', subName: 'Digital Systems and Microprocessors Design', teacherId: 't2', teacherName: 'Dr. V. Sivamurugan' },
  { id: 'itb_11', section: 'IT B', venue: 'EH 6', day: 3, dayName: 'Wed', p: 1, time: '08:00 - 08:45', subCode: 'UMA3353', subName: 'Mathematical Foundations for Computing Technology', teacherId: 't4', teacherName: 'Dr. P. Jaish' },
  { id: 'itb_12', section: 'IT B', venue: 'EH 6', day: 3, dayName: 'Wed', p: 2, time: '08:45 - 09:30', subCode: 'UIT3301', subName: 'Database Technology', teacherId: 't6', teacherName: 'Dr. N. Kalaichelvi' },
  { id: 'itb_13', section: 'IT B', venue: 'EH 6', day: 3, dayName: 'Wed', p: 5, time: '12:20 - 13:05', subCode: 'UITV303', subName: 'Skill Development Software - 1', teacherId: 't6', teacherName: 'Dr. N. Kalaichelvi' },
  { id: 'itb_14', section: 'IT B', venue: 'EH 6', day: 4, dayName: 'Thu', p: 1, time: '08:00 - 08:45', subCode: 'UIT3301', subName: 'Database Technology', teacherId: 't6', teacherName: 'Dr. N. Kalaichelvi' },
  { id: 'itb_15', section: 'IT B', venue: 'EH 6', day: 4, dayName: 'Thu', p: 2, time: '08:45 - 09:30', subCode: 'UIT3361', subName: 'Object-Oriented Programming Using Java', teacherId: 't5', teacherName: 'Dr. M. Mohamed Iqbal' },
  { id: 'itb_16', section: 'IT B', venue: 'EH 6', day: 4, dayName: 'Thu', p: 5, time: '12:20 - 13:05', subCode: 'UIT3362', subName: 'Principles of Software Engineering and Practices', teacherId: 't7', teacherName: 'Dr. G. Sornavalli' },
  { id: 'itb_17', section: 'IT B', venue: 'EH 6', day: 5, dayName: 'Fri', p: 1, time: '08:00 - 08:45', subCode: 'UHS3386', subName: 'Universal Human Values 2: Understanding Harmony', teacherId: 't3', teacherName: 'Dr. S. I. Davis Presley' },
  { id: 'itb_18', section: 'IT B', venue: 'EH 6', day: 5, dayName: 'Fri', p: 2, time: '08:45 - 09:30', subCode: 'UIT3362', subName: 'Principles of Software Engineering and Practices', teacherId: 't7', teacherName: 'Dr. G. Sornavalli' },
  { id: 'itb_19', section: 'IT B', venue: 'EH 6', day: 5, dayName: 'Fri', p: 3, time: '09:50 - 10:35', subCode: 'UIT3361', subName: 'Object-Oriented Programming Using Java', teacherId: 't5', teacherName: 'Dr. M. Mohamed Iqbal' },
  { id: 'itb_20', section: 'IT B', venue: 'EH 6', day: 5, dayName: 'Fri', p: 4, time: '10:35 - 11:20', subCode: 'UIT3363', subName: 'Digital Systems and Microprocessors Design', teacherId: 't2', teacherName: 'Dr. V. Sivamurugan' },
  { id: 'itb_21', section: 'IT B', venue: 'EH 6', day: 5, dayName: 'Fri', p: 5, time: '12:20 - 13:05', subCode: 'UMA3353', subName: 'Mathematical Foundations for Computing Technology', teacherId: 't4', teacherName: 'Dr. P. Jaish' },
  { id: 'itb_22', section: 'IT B', venue: 'EH 6', day: 5, dayName: 'Fri', p: 6, time: '13:05 - 13:50', subCode: 'UIT3302', subName: 'Introduction to Digital Communication', teacherId: 't1', teacherName: 'Dr. Arige Sumanth' }
];

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SSN IT Attendance System - Standalone Portal</title>
  <style>
    :root {
      --primary: #0f172a;
      --accent: #2563eb;
      --success: #059669;
      --success-bg: #dcfce7;
      --danger: #dc2626;
      --danger-bg: #fee2e2;
      --bg: #f8fafc;
      --card: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: var(--bg); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; }
    header { background: #ffffff; border-bottom: 1px solid var(--border); padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-logo { width: 36px; height: 36px; background: var(--primary); color: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; }
    .brand h1 { font-size: 1.1rem; font-weight: 800; color: var(--primary); }
    .brand small { font-size: 0.72rem; color: var(--muted); display: block; }
    .nav-modes { display: flex; gap: 6px; background: #f1f5f9; padding: 4px; border-radius: 10px; }
    .mode-btn { border: none; background: transparent; padding: 7px 14px; font-size: 0.82rem; font-weight: 600; color: var(--muted); border-radius: 7px; cursor: pointer; transition: all 0.15s; }
    .mode-btn.active { background: #ffffff; color: var(--primary); box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-weight: 700; }
    main { flex: 1; padding: 20px; max-width: 1300px; margin: 0 auto; width: 100%; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 20px; }
    .teacher-switcher-banner { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; border-radius: 14px; padding: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .teacher-info h2 { font-size: 1.35rem; font-weight: 800; margin-bottom: 4px; }
    .teacher-info p { font-size: 0.85rem; color: #94a3b8; }
    .teacher-select-box { background: rgba(255,255,255,0.12); padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); }
    .teacher-select-box label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #cbd5e1; display: block; margin-bottom: 4px; font-weight: 700; }
    .teacher-select-box select { background: #ffffff; color: var(--primary); border: none; padding: 8px 14px; border-radius: 6px; font-size: 0.9rem; font-weight: 700; outline: none; cursor: pointer; }
    .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
    .badge-primary { background: #dbeafe; color: #1d4ed8; }
    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-warning { background: #fef3c7; color: #b45309; }
    .badge-danger { background: #fee2e2; color: #b91c1c; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 20px; }
    .stat-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 16px; text-align: left; }
    .stat-val { font-size: 1.7rem; font-weight: 800; color: var(--primary); }
    .stat-lbl { font-size: 0.78rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; margin-top: 2px; }
    .periods-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
    .period-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.15s; }
    .period-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: var(--accent); }
    .period-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .period-card h3 { font-size: 1rem; font-weight: 700; color: var(--primary); margin-bottom: 4px; }
    .period-card p { font-size: 0.82rem; color: var(--muted); margin-bottom: 14px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; border: none; cursor: pointer; transition: all 0.15s; text-decoration: none; }
    .btn-primary { background: var(--accent); color: #ffffff; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-success { background: var(--success); color: #ffffff; }
    .btn-success:hover { background: #047857; }
    .btn-danger { background: var(--danger); color: #ffffff; }
    .btn-outline { background: #ffffff; border: 1px solid var(--border); color: var(--text); }
    .btn-outline:hover { background: #f1f5f9; }
    .btn-sm { padding: 5px 10px; font-size: 0.78rem; }
    .roster-header-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
    .metric-counters { display: flex; gap: 10px; }
    .metric-box { padding: 8px 14px; border-radius: 10px; text-align: center; }
    .metric-box small { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; display: block; }
    .metric-box strong { font-size: 1.3rem; font-weight: 800; }
    .metric-box.total { background: #f1f5f9; color: var(--primary); }
    .metric-box.present { background: var(--success-bg); color: var(--success); }
    .metric-box.absent { background: var(--danger-bg); color: var(--danger); }
    .roster-controls { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
    .search-input { flex: 1; min-width: 220px; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.9rem; outline: none; }
    .search-input:focus { border-color: var(--accent); }
    .students-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 10px; margin-bottom: 80px; }
    .student-card { background: #ffffff; border: 2px solid #bbf7d0; border-radius: 12px; padding: 12px; cursor: pointer; user-select: none; transition: transform 0.1s, border-color 0.15s, background 0.15s; display: flex; flex-direction: column; }
    .student-card:active { transform: scale(0.96); }
    .student-card.is-present { background: #f0fdf4; border-color: #86efac; }
    .student-card.is-absent { background: #fef2f2; border-color: #f87171; }
    .student-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .roll-pill { font-size: 0.8rem; font-weight: 800; background: var(--primary); color: #fff; padding: 2px 6px; border-radius: 6px; }
    .status-tag { font-size: 0.68rem; font-weight: 800; padding: 3px 6px; border-radius: 999px; text-transform: uppercase; }
    .status-tag.present { background: var(--success-bg); color: var(--success); }
    .status-tag.absent { background: var(--danger); color: #ffffff; }
    .student-name { font-size: 0.88rem; font-weight: 700; color: var(--primary); line-height: 1.25; margin-bottom: 2px; }
    .student-reg { font-size: 0.72rem; color: var(--muted); margin-bottom: 8px; }
    .student-hint { font-size: 0.68rem; color: var(--muted); margin-top: auto; border-top: 1px dashed var(--border); padding-top: 4px; }
    .sticky-submit-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-top: 1px solid var(--border); padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 90; box-shadow: 0 -4px 16px rgba(0,0,0,0.08); }
    .table-container { width: 100%; overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; background: #ffffff; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
    th { background: #f8fafc; color: var(--muted); font-weight: 700; padding: 10px 14px; border-bottom: 1px solid var(--border); text-transform: uppercase; font-size: 0.74rem; }
    td { padding: 12px 14px; border-bottom: 1px solid var(--border); color: var(--primary); }
    tr:hover td { background: #f8fafc; }
    .sheet-matrix-table th.matrix-header { background: #0f172a; color: #ffffff; text-align: center; }
    .sheet-cell-p { background: #dcfce7; color: #15803d; font-weight: 800; text-align: center; }
    .sheet-cell-a { background: #fee2e2; color: #b91c1c; font-weight: 800; text-align: center; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 200; }
    .modal-card { background: #fff; border-radius: 14px; width: 100%; max-width: 500px; padding: 24px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); }
    @media (max-width: 768px) {
      header { padding: 10px 14px; }
      .brand h1 { font-size: 0.95rem; }
      main { padding: 12px; }
      .teacher-switcher-banner { padding: 14px; flex-direction: column; align-items: stretch; }
      .teacher-select-box select { width: 100%; }
      .stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
      .students-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
      .sticky-submit-bar { flex-direction: column; gap: 8px; }
      .sticky-submit-bar .btn { width: 100%; }
      .modal-overlay { align-items: flex-end; padding: 0; }
      .modal-card { border-radius: 16px 16px 0 0; max-height: 85vh; padding: 18px; }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-logo">IT</div>
      <div>
        <h1>SSN COLLEGE OF ENGINEERING</h1>
        <small>Department of Information Technology • Standalone Portal</small>
      </div>
    </div>
    <div class="nav-modes">
      <button class="mode-btn active" id="btnModeTeacher" onclick="switchPortalMode('teacher')">👨‍🏫 Faculty Portal</button>
      <button class="mode-btn" id="btnModeAdmin" onclick="switchPortalMode('admin')">🛡️ Admin Console</button>
      <button class="mode-btn" id="btnModeSheet" onclick="switchPortalMode('sheet')">📊 Master Google Sheet</button>
    </div>
  </header>

  <main>
    <!-- VIEW 1: FACULTY PORTAL -->
    <div id="viewTeacher">
      <div class="teacher-switcher-banner">
        <div class="teacher-info">
          <div class="badge badge-success" style="margin-bottom: 6px;">Active Faculty Login</div>
          <h2 id="activeTeacherName">Dr. Arige Sumanth</h2>
          <p id="activeTeacherEmail">ariges@ssn.edu.in • Information Technology</p>
          <div style="margin-top: 6px; font-size: 0.8rem; color: #cbd5e1;" id="activeTeacherSubjects">
            Subjects: UIT3302 - Introduction to Digital Communication
          </div>
        </div>
        <div class="teacher-select-box">
          <label>Switch Active Teacher Profile:</label>
          <select id="teacherSelect" onchange="onTeacherChange(this.value)"></select>
        </div>
      </div>

      <div id="teacherDashboardContent">
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
            <div>
              <h2 style="font-size: 1.15rem; font-weight: 800;">My Scheduled Timetable Periods (<span id="teacherPeriodsCount">6</span>)</h2>
              <p style="font-size: 0.82rem; color: var(--muted);">Click any period card below to take attendance for that class.</p>
            </div>
            <button class="btn btn-outline btn-sm" onclick="switchPortalMode('sheet')">📊 View Master Sheet</button>
          </div>
          <div class="periods-grid" id="teacherPeriodsGrid"></div>
        </div>
      </div>

      <div id="teacherAttendanceContent" style="display: none;">
        <div class="card">
          <div class="roster-header-bar">
            <div>
              <button class="btn btn-outline btn-sm" onclick="closeAttendanceView()" style="margin-bottom: 6px;">← Back to My Schedule</button>
              <h2 id="attSlotTitle" style="font-size: 1.2rem; font-weight: 800;">UIT3302 (IT A)</h2>
              <p id="attSlotMeta" style="font-size: 0.82rem; color: var(--muted);">Period 5 • 12:20 - 13:05 • Venue: EH 5</p>
            </div>
            <div class="metric-counters">
              <div class="metric-box total"><small>Total</small><strong id="cntTotal">71</strong></div>
              <div class="metric-box present"><small>Present</small><strong id="cntPresent">71</strong></div>
              <div class="metric-box absent"><small>Absent</small><strong id="cntAbsent">0</strong></div>
            </div>
          </div>

          <div class="roster-controls">
            <input type="text" class="search-input" id="studentSearch" placeholder="🔍 Search student by name or roll number..." oninput="onStudentSearch(this.value)">
            <button class="btn btn-outline btn-sm" onclick="markAllPresent()">✓ Select All Present</button>
            <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: #fecaca; background: #fef2f2;" onclick="markAllAbsent()">✗ Select All Absent</button>
          </div>

          <div class="students-grid" id="studentsGrid"></div>
        </div>

        <div class="sticky-submit-bar">
          <div style="font-size: 0.85rem; color: var(--muted);">
            Submitting for <strong id="submitSlotLabel">IT A - Period 5</strong>: <span id="submitSummaryText" style="color: var(--primary); font-weight: 700;">71 Present, 0 Absent</span>
          </div>
          <button class="btn btn-success" onclick="submitAttendanceSession()">Submit Attendance & Sync Sheet 🚀</button>
        </div>
      </div>
    </div>

    <!-- VIEW 2: ADMIN CONSOLE -->
    <div id="viewAdmin" style="display: none;">
      <div class="teacher-switcher-banner" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);">
        <div class="teacher-info">
          <div class="badge badge-warning" style="margin-bottom: 6px;">Institutional Administrator</div>
          <h2>SSN IT Department Admin Console</h2>
          <p>Full database overview, student rosters, faculty directory & timetable matrix.</p>
        </div>
        <button class="btn btn-success" onclick="openOverrideModal()">✏️ Update / Override Attendance</button>
      </div>

      <div class="stats-grid">
        <div class="stat-card"><div class="stat-val">141</div><div class="stat-lbl">Total Students (IT A + IT B)</div></div>
        <div class="stat-card"><div class="stat-val">9</div><div class="stat-lbl">Faculty Members</div></div>
        <div class="stat-card"><div class="stat-val">9</div><div class="stat-lbl">Core Subjects</div></div>
        <div class="stat-card"><div class="stat-val">44</div><div class="stat-lbl">Weekly Period Slots</div></div>
      </div>

      <div style="display: flex; gap: 6px; margin-bottom: 16px; overflow-x: auto;">
        <button class="btn btn-outline btn-sm" id="tabBtnStudents" onclick="switchAdminTab('students')">🎓 Student Roster (141)</button>
        <button class="btn btn-outline btn-sm" id="tabBtnFaculty" onclick="switchAdminTab('faculty')">👨‍🏫 Faculty Directory (9)</button>
        <button class="btn btn-outline btn-sm" id="tabBtnTimetable" onclick="switchAdminTab('timetable')">📅 Timetable Matrix (44)</button>
        <button class="btn btn-outline btn-sm" id="tabBtnLogs" onclick="switchAdminTab('logs')">📋 Attendance Logs</button>
      </div>

      <div id="adminTabStudents" class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
          <h3 style="font-size: 1.05rem; font-weight: 800;">Students Master Database</h3>
          <div style="display: flex; gap: 8px;">
            <select id="adminSectionFilter" style="padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border);" onchange="renderAdminStudents()">
              <option value="ALL">All Sections (141)</option>
              <option value="IT A">IT A (001 - 071)</option>
              <option value="IT B">IT B (072 - 141)</option>
            </select>
            <input type="text" id="adminStudentSearch" placeholder="Search student..." style="padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border);" oninput="renderAdminStudents()">
          </div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>Roll No</th><th>Register No</th><th>Student Name</th><th>Section</th><th>Action</th></tr>
            </thead>
            <tbody id="adminStudentsTableBody"></tbody>
          </table>
        </div>
      </div>

      <div id="adminTabFaculty" class="card" style="display: none;">
        <h3 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 14px;">Faculty Directory & Assigned Subjects</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>Code</th><th>Faculty Name</th><th>Institutional Email</th><th>Department</th><th>Assigned Subjects</th></tr>
            </thead>
            <tbody id="adminFacultyTableBody"></tbody>
          </table>
        </div>
      </div>

      <div id="adminTabTimetable" class="card" style="display: none;">
        <h3 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 14px;">Complete Weekly Timetable Matrix (44 Periods)</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>Day</th><th>Period</th><th>Time</th><th>Section / Venue</th><th>Subject Code</th><th>Subject Name</th><th>Faculty</th></tr>
            </thead>
            <tbody id="adminTimetableTableBody"></tbody>
          </table>
        </div>
      </div>

      <div id="adminTabLogs" class="card" style="display: none;">
        <h3 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 14px;">Attendance Session Audit Logs</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>Timestamp</th><th>Date</th><th>Period</th><th>Section</th><th>Subject</th><th>Faculty</th><th>Total</th><th>Present</th><th>Absent</th><th>Absent Roll Numbers</th></tr>
            </thead>
            <tbody id="adminLogsTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- VIEW 3: MASTER SPREADSHEET LIVE MATRIX -->
    <div id="viewSheet" style="display: none;">
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h2 style="font-size: 1.2rem; font-weight: 800;">Master Google Spreadsheet Simulation</h2>
            <p style="font-size: 0.82rem; color: var(--muted);">Live visual representation of the Google Sheets Attendance Matrix.</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <select id="matrixSectionSelect" style="padding: 6px 12px; border-radius: 6px; font-weight: 700;" onchange="renderSheetMatrix()">
              <option value="IT A - UIT3302">IT A - UIT3302 (Dr. Arige Sumanth)</option>
              <option value="IT B - UIT3302">IT B - UIT3302 (Dr. Arige Sumanth)</option>
              <option value="IT A - UIT3361">IT A - UIT3361 (Dr. H. Sabireen)</option>
              <option value="IT B - UIT3361">IT B - UIT3361 (Dr. M. Mohamed Iqbal)</option>
              <option value="IT A - UIT3301">IT A - UIT3301 (Dr. N. Kalaichelvi)</option>
              <option value="IT B - UIT3301">IT B - UIT3301 (Dr. N. Kalaichelvi)</option>
              <option value="IT A - UIT3363">IT A - UIT3363 (Dr. V. Sivamurugan)</option>
              <option value="IT B - UIT3363">IT B - UIT3363 (Dr. V. Sivamurugan)</option>
            </select>
          </div>
        </div>

        <div class="table-container">
          <table class="sheet-matrix-table" id="sheetMatrixTable"></table>
        </div>
      </div>
    </div>
  </main>

  <!-- OVERRIDE ATTENDANCE MODAL -->
  <div id="overrideModal" class="modal-overlay" style="display: none;">
    <div class="modal-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <h3 style="font-size: 1.15rem; font-weight: 800;">✏️ Update Student Attendance</h3>
        <button onclick="closeOverrideModal()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;">✕</button>
      </div>
      <form onsubmit="saveAttendanceOverride(event)">
        <div style="margin-bottom: 12px;">
          <label style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Select Student:</label>
          <select id="modalStudentSelect" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border);" required></select>
        </div>
        <div style="margin-bottom: 12px;">
          <label style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Date:</label>
          <input type="date" id="modalDateInput" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border);" required>
        </div>
        <div style="margin-bottom: 12px;">
          <label style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Timetable Slot:</label>
          <select id="modalSlotSelect" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border);" required></select>
        </div>
        <div style="margin-bottom: 12px;">
          <label style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Status:</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button type="button" id="btnStatusPresent" class="btn btn-outline" style="border: 2px solid var(--success); color: var(--success);" onclick="setModalStatus('PRESENT')">✅ PRESENT</button>
            <button type="button" id="btnStatusAbsent" class="btn btn-outline" onclick="setModalStatus('ABSENT')">❌ ABSENT</button>
          </div>
        </div>
        <div style="margin-bottom: 16px;">
          <label style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Remarks / Reason:</label>
          <input type="text" id="modalRemarksInput" placeholder="e.g., Medical Certificate, OD Approval" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border);">
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn-outline" style="flex: 1;" onclick="closeOverrideModal()">Cancel</button>
          <button type="submit" class="btn btn-success" style="flex: 1;">Save & Sync</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    const ROSTER_IT_A = ${JSON.stringify(ROSTER_IT_A)};
    const ROSTER_IT_B = ${JSON.stringify(ROSTER_IT_B)};
    const TEACHERS = ${JSON.stringify(TEACHERS)};
    const SUBJECTS = ${JSON.stringify(SUBJECTS)};
    const TIMETABLE = ${JSON.stringify(TIMETABLE)};

    let currentTeacherId = 't1';
    let currentSlot = null;
    let absentStudentSet = new Set();
    let modalSelectedStatus = 'PRESENT';
    let sessionLogs = [
      {
        timestamp: '2026-08-23 10:35:00',
        date: '2026-08-23',
        period: 'Period 1',
        section: 'IT A',
        subject: 'Introduction to Digital Communication (UIT3302)',
        faculty: 'Dr. Arige Sumanth',
        total: 71,
        present: 70,
        absent: 1,
        absentRolls: '002'
      }
    ];

    window.addEventListener('DOMContentLoaded', () => {
      populateTeacherDropdown();
      renderActiveTeacher();
      renderAdminFaculty();
      renderAdminTimetable();
      renderAdminStudents();
      renderAdminLogs();
      renderSheetMatrix();
    });

    function switchPortalMode(mode) {
      document.getElementById('viewTeacher').style.display = mode === 'teacher' ? 'block' : 'none';
      document.getElementById('viewAdmin').style.display = mode === 'admin' ? 'block' : 'none';
      document.getElementById('viewSheet').style.display = mode === 'sheet' ? 'block' : 'none';

      document.getElementById('btnModeTeacher').classList.toggle('active', mode === 'teacher');
      document.getElementById('btnModeAdmin').classList.toggle('active', mode === 'admin');
      document.getElementById('btnModeSheet').classList.toggle('active', mode === 'sheet');

      if (mode === 'sheet') renderSheetMatrix();
    }

    function populateTeacherDropdown() {
      const select = document.getElementById('teacherSelect');
      select.innerHTML = TEACHERS.map(t => \`<option value="\${t.id}">\${t.name} (\${t.code})</option>\`).join('');
    }

    function onTeacherChange(teacherId) {
      currentTeacherId = teacherId;
      renderActiveTeacher();
    }

    function renderActiveTeacher() {
      const teacher = TEACHERS.find(t => t.id === currentTeacherId) || TEACHERS[0];
      document.getElementById('activeTeacherName').innerText = teacher.name;
      document.getElementById('activeTeacherEmail').innerText = \`\${teacher.email} • \${teacher.dept}\`;
      document.getElementById('activeTeacherSubjects').innerText = 'Subjects: ' + teacher.subjects.join(', ');

      const slots = TIMETABLE.filter(slot => slot.teacherId === teacher.id);
      document.getElementById('teacherPeriodsCount').innerText = slots.length;

      const grid = document.getElementById('teacherPeriodsGrid');
      if (slots.length === 0) {
        grid.innerHTML = '<p style=\"color: var(--muted);\">No periods assigned to this faculty.</p>';
      } else {
        grid.innerHTML = slots.map(s => \`
          <div class=\"period-card\">
            <div>
              <div class=\"period-card-header\">
                <span class=\"badge badge-primary\">\${s.dayName} • Period \${s.p}</span>
                <span class=\"badge badge-success\">\${s.section}</span>
              </div>
              <h3>\${s.subCode} - \${s.subName}</h3>
              <p>Venue: <strong>\${s.venue}</strong> | Time: <strong>\${s.time}</strong></p>
            </div>
            <button class=\"btn btn-primary\" style=\"width: 100%;\" onclick=\"openAttendanceView('\${s.id}')\">Take Attendance →</button>
          </div>
        \`).join('');
      }
    }

    function openAttendanceView(slotId) {
      currentSlot = TIMETABLE.find(s => s.id === slotId);
      if (!currentSlot) return;

      document.getElementById('teacherDashboardContent').style.display = 'none';
      document.getElementById('teacherAttendanceContent').style.display = 'block';

      document.getElementById('attSlotTitle').innerText = \`\${currentSlot.subCode} (\${currentSlot.section})\`;
      document.getElementById('attSlotMeta').innerText = \`\${currentSlot.dayName} • Period \${currentSlot.p} (\${currentSlot.time}) • Venue: \${currentSlot.venue}\`;
      document.getElementById('submitSlotLabel').innerText = \`\${currentSlot.section} - Period \${currentSlot.p}\`;

      absentStudentSet.clear();
      renderStudentsRoster();
      updateCounters();
    }

    function closeAttendanceView() {
      document.getElementById('teacherAttendanceContent').style.display = 'none';
      document.getElementById('teacherDashboardContent').style.display = 'block';
    }

    function getActiveRoster() {
      if (!currentSlot) return ROSTER_IT_A;
      return currentSlot.section.includes('IT B') ? ROSTER_IT_B : ROSTER_IT_A;
    }

    function renderStudentsRoster(filterText = '') {
      const roster = getActiveRoster();
      const q = (filterText || '').toLowerCase().trim();
      const filtered = q
        ? roster.filter(s => s.name.toLowerCase().includes(q) || s.roll.includes(q) || s.reg.includes(q))
        : roster;

      const grid = document.getElementById('studentsGrid');
      grid.innerHTML = filtered.map(s => {
        const isAbsent = absentStudentSet.has(s.roll);
        return \`
          <div class=\"student-card \${isAbsent ? 'is-absent' : 'is-present'}\" onclick=\"toggleStudentAbsent('\${s.roll}')\">
            <div class=\"student-top\">
              <span class=\"roll-pill\">\${s.roll}</span>
              <span class=\"status-tag \${isAbsent ? 'absent' : 'present'}\">\${isAbsent ? 'ABSENT' : 'PRESENT'}</span>
            </div>
            <div class=\"student-name\">\${s.name}</div>
            <div class=\"student-reg\">Reg: \${s.reg}</div>
            <div class=\"student-hint\">\${isAbsent ? 'Tap to mark Present' : 'Tap to mark Absent'}</div>
          </div>
        \`;
      }).join('');
    }

    function toggleStudentAbsent(roll) {
      if (absentStudentSet.has(roll)) {
        absentStudentSet.delete(roll);
      } else {
        absentStudentSet.add(roll);
      }
      renderStudentsRoster(document.getElementById('studentSearch').value);
      updateCounters();
    }

    function markAllPresent() {
      absentStudentSet.clear();
      renderStudentsRoster(document.getElementById('studentSearch').value);
      updateCounters();
    }

    function markAllAbsent() {
      const roster = getActiveRoster();
      roster.forEach(s => absentStudentSet.add(s.roll));
      renderStudentsRoster(document.getElementById('studentSearch').value);
      updateCounters();
    }

    function onStudentSearch(val) {
      renderStudentsRoster(val);
    }

    function updateCounters() {
      const total = getActiveRoster().length;
      const absent = absentStudentSet.size;
      const present = total - absent;

      document.getElementById('cntTotal').innerText = total;
      document.getElementById('cntPresent').innerText = present;
      document.getElementById('cntAbsent').innerText = absent;
      document.getElementById('submitSummaryText').innerText = \`\${present} Present, \${absent} Absent\`;
    }

    function submitAttendanceSession() {
      const total = getActiveRoster().length;
      const absent = absentStudentSet.size;
      const present = total - absent;
      const absentRolls = Array.from(absentStudentSet).sort().join(', ') || 'None';

      const newLog = {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        date: new Date().toISOString().split('T')[0],
        period: \`Period \${currentSlot.p}\`,
        section: currentSlot.section,
        subject: \`\${currentSlot.subName} (\${currentSlot.subCode})\`,
        faculty: currentSlot.teacherName,
        total,
        present,
        absent,
        absentRolls
      };

      sessionLogs.unshift(newLog);
      alert(\`✅ Attendance Recorded Successfully!\\n\\nClass: \${currentSlot.section} - \${currentSlot.subCode}\\nFaculty: \${currentSlot.teacherName}\\nPresent: \${present} | Absent: \${absent}\\n\\nSynced with Master Google Sheet!\`);
      renderAdminLogs();
      closeAttendanceView();
    }

    function switchAdminTab(tab) {
      document.getElementById('adminTabStudents').style.display = tab === 'students' ? 'block' : 'none';
      document.getElementById('adminTabFaculty').style.display = tab === 'faculty' ? 'block' : 'none';
      document.getElementById('adminTabTimetable').style.display = tab === 'timetable' ? 'block' : 'none';
      document.getElementById('adminTabLogs').style.display = tab === 'logs' ? 'block' : 'none';
    }

    function renderAdminStudents() {
      const sec = document.getElementById('adminSectionFilter').value;
      const q = (document.getElementById('adminStudentSearch').value || '').toLowerCase().trim();

      let list = [];
      if (sec === 'IT A') list = ROSTER_IT_A.map(s => ({ ...s, section: 'IT A' }));
      else if (sec === 'IT B') list = ROSTER_IT_B.map(s => ({ ...s, section: 'IT B' }));
      else list = [...ROSTER_IT_A.map(s => ({ ...s, section: 'IT A' })), ...ROSTER_IT_B.map(s => ({ ...s, section: 'IT B' }))];

      if (q) list = list.filter(s => s.name.toLowerCase().includes(q) || s.roll.includes(q) || s.reg.includes(q));

      const tbody = document.getElementById('adminStudentsTableBody');
      tbody.innerHTML = list.map(s => \`
        <tr>
          <td><strong>\${s.roll}</strong></td>
          <td><code>\${s.reg}</code></td>
          <td>\${s.name}</td>
          <td><span class=\"badge badge-primary\">\${s.section}</span></td>
          <td><button class=\"btn btn-outline btn-sm\" onclick=\"openOverrideForStudent('\${s.roll}')\">✏️ Mark Attd</button></td>
        </tr>
      \`).join('');
    }

    function renderAdminFaculty() {
      const tbody = document.getElementById('adminFacultyTableBody');
      tbody.innerHTML = TEACHERS.map(t => \`
        <tr>
          <td><code>\${t.code}</code></td>
          <td><strong>\${t.name}</strong></td>
          <td>\${t.email}</td>
          <td>\${t.dept}</td>
          <td><small>\${t.subjects.join('<br>')}</small></td>
        </tr>
      \`).join('');
    }

    function renderAdminTimetable() {
      const tbody = document.getElementById('adminTimetableTableBody');
      tbody.innerHTML = TIMETABLE.map(tt => \`
        <tr>
          <td><strong>\${tt.dayName}</strong></td>
          <td>Period \${tt.p}</td>
          <td><small>\${tt.time}</small></td>
          <td><span class=\"badge badge-primary\">\${tt.section} (\${tt.venue})</span></td>
          <td><code>\${tt.subCode}</code></td>
          <td>\${tt.subName}</td>
          <td><strong>\${tt.teacherName}</strong></td>
        </tr>
      \`).join('');
    }

    function renderAdminLogs() {
      const tbody = document.getElementById('adminLogsTableBody');
      tbody.innerHTML = sessionLogs.map(l => \`
        <tr>
          <td><small>\${l.timestamp}</small></td>
          <td>\${l.date}</td>
          <td>\${l.period}</td>
          <td><span class=\"badge badge-primary\">\${l.section}</span></td>
          <td>\${l.subject}</td>
          <td><strong>\${l.faculty}</strong></td>
          <td>\${l.total}</td>
          <td style=\"color: var(--success); font-weight: 700;\">\${l.present}</td>
          <td style=\"color: var(--danger); font-weight: 700;\">\${l.absent}</td>
          <td><small>\${l.absentRolls}</small></td>
        </tr>
      \`).join('');
    }

    function renderSheetMatrix() {
      const val = document.getElementById('matrixSectionSelect').value;
      const isItB = val.includes('IT B');
      const roster = isItB ? ROSTER_IT_B : ROSTER_IT_A;
      const section = isItB ? 'IT B' : 'IT A';
      const subCode = val.includes('UIT3302') ? 'UIT3302' : (val.includes('UIT3361') ? 'UIT3361' : 'UIT3301');
      const teacher = TIMETABLE.find(t => t.subCode === subCode && t.section === section)?.teacherName || 'Faculty';

      const table = document.getElementById('sheetMatrixTable');
      let html = \`
        <thead>
          <tr>
            <th colspan=\"3\" class=\"matrix-header\" style=\"font-size: 0.95rem;\">SSN COLLEGE OF ENGINEERING — IT DEPT</th>
            <th colspan=\"3\" class=\"matrix-header\">ATTENDANCE RECORDS</th>
          </tr>
          <tr>
            <th colspan=\"3\" style=\"background: #334155; color: #f8fafc; text-align: center;\">Course: \${subCode} | Section: \${section} | Faculty: \${teacher}</th>
            <th style=\"background: #1e293b; color: #fff; text-align: center;\">24/08<br>Period 1</th>
            <th style=\"background: #1e293b; color: #fff; text-align: center;\">23/08<br>Period 2</th>
            <th style=\"background: #1e293b; color: #fff; text-align: center;\">22/08<br>Period 5</th>
          </tr>
          <tr>
            <th>Roll No</th>
            <th>Register Number</th>
            <th>Student Name</th>
            <th style=\"text-align: center;\">Status</th>
            <th style=\"text-align: center;\">Status</th>
            <th style=\"text-align: center;\">Status</th>
          </tr>
        </thead>
        <tbody>
      \`;

      html += roster.map((s, idx) => {
        const isAbsent1 = (idx === 1 || idx === 6);
        const isAbsent2 = (idx === 11 || idx === 24);
        return \`
          <tr>
            <td><strong>\${s.roll}</strong></td>
            <td><code>\${s.reg}</code></td>
            <td>\${s.name}</td>
            <td class=\"\${isAbsent1 ? 'sheet-cell-a' : 'sheet-cell-p'}\">\${isAbsent1 ? 'A' : 'P'}</td>
            <td class=\"\${isAbsent2 ? 'sheet-cell-a' : 'sheet-cell-p'}\">\${isAbsent2 ? 'A' : 'P'}</td>
            <td class=\"sheet-cell-p\">P</td>
          </tr>
        \`;
      }).join('');

      html += '</tbody>';
      table.innerHTML = html;
    }

    function openOverrideModal() {
      const allStudents = [...ROSTER_IT_A.map(s => ({ ...s, section: 'IT A' })), ...ROSTER_IT_B.map(s => ({ ...s, section: 'IT B' }))];
      document.getElementById('modalStudentSelect').innerHTML = allStudents.map(s => \`<option value=\"\${s.roll}\">\${s.roll} - \${s.name} (\${s.section})</option>\`).join('');
      document.getElementById('modalDateInput').value = new Date().toISOString().split('T')[0];
      document.getElementById('modalSlotSelect').innerHTML = TIMETABLE.map(tt => \`<option value=\"\${tt.id}\">\${tt.dayName} P\${tt.p} - \${tt.subCode} (\${tt.section}) - \${tt.teacherName}</option>\`).join('');
      document.getElementById('overrideModal').style.display = 'flex';
    }

    function openOverrideForStudent(roll) {
      openOverrideModal();
      document.getElementById('modalStudentSelect').value = roll;
    }

    function closeOverrideModal() {
      document.getElementById('overrideModal').style.display = 'none';
    }

    function setModalStatus(status) {
      modalSelectedStatus = status;
      document.getElementById('btnStatusPresent').style.borderColor = status === 'PRESENT' ? 'var(--success)' : 'var(--border)';
      document.getElementById('btnStatusPresent').style.color = status === 'PRESENT' ? 'var(--success)' : 'var(--text)';
      document.getElementById('btnStatusAbsent').style.borderColor = status === 'ABSENT' ? 'var(--danger)' : 'var(--border)';
      document.getElementById('btnStatusAbsent').style.color = status === 'ABSENT' ? 'var(--danger)' : 'var(--text)';
    }

    function saveAttendanceOverride(e) {
      e.preventDefault();
      const studentRoll = document.getElementById('modalStudentSelect').value;
      const date = document.getElementById('modalDateInput').value;
      const slotId = document.getElementById('modalSlotSelect').value;
      const slot = TIMETABLE.find(s => s.id === slotId);

      alert(\`✅ Attendance Corrected!\\n\\nStudent Roll: \${studentRoll}\\nDate: \${date}\\nSlot: \${slot.subCode} (\${slot.section})\\nStatus: \${modalSelectedStatus}\\n\\nUpdated & Synced to Google Sheet!\`);
      closeOverrideModal();
    }
  </script>
</body>
</html>`;

fs.writeFileSync('standalone-portal.html', htmlContent);
fs.writeFileSync('docs/standalone-portal.html', htmlContent);
console.log('Successfully generated standalone-portal.html and docs/standalone-portal.html');
