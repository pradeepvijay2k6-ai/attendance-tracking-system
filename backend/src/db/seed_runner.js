require('dotenv').config();
const supabase = require('../config/supabase');

const studentsData = [
  // Page 1 (1 to 24) -> IT A
  { roll_no: '001', register_no: '3122255002001', full_name: 'Aaditya B M', email: 'aaditya2510444@ssn.edu.in', section: 'IT A' },
  { roll_no: '002', register_no: '3122255002002', full_name: 'Adhiti Sudhakar', email: 'adhiti2510024@ssn.edu.in', section: 'IT A' },
  { roll_no: '003', register_no: '3122255002003', full_name: 'Adithya Kumaresan', email: 'adithya2510014@ssn.edu.in', section: 'IT A' },
  { roll_no: '004', register_no: '3122255002004', full_name: 'Adithya M', email: 'adithya2510949@ssn.edu.in', section: 'IT A' },
  { roll_no: '005', register_no: '3122255002005', full_name: 'Afsheen S', email: 'afsheen2510149@ssn.edu.in', section: 'IT A' },
  { roll_no: '006', register_no: '3122255002006', full_name: 'Agalya S', email: 'agalya2510415@ssn.edu.in', section: 'IT A' },
  { roll_no: '007', register_no: '3122255002007', full_name: 'Ajay A', email: 'ajay2510941@ssn.edu.in', section: 'IT A' },
  { roll_no: '008', register_no: '3122255002008', full_name: 'Akshaya R', email: 'akshaya2510131@ssn.edu.in', section: 'IT A' },
  { roll_no: '009', register_no: '3122255002009', full_name: 'Akshaya R', email: 'akshaya2510928@ssn.edu.in', section: 'IT A' },
  { roll_no: '010', register_no: '3122255002010', full_name: 'Alden B L', email: 'alden2510129@ssn.edu.in', section: 'IT A' },
  { roll_no: '011', register_no: '3122255002011', full_name: 'Anas Ahamed S', email: 'anasahamed2510598@ssn.edu.in', section: 'IT A' },
  { roll_no: '012', register_no: '3122255002012', full_name: 'Anfara Shyma A', email: 'anfarashyma2510580@ssn.edu.in', section: 'IT A' },
  { roll_no: '013', register_no: '3122255002013', full_name: 'Anirudh Badri Narayanan', email: 'anirudhbadri2510039@ssn.edu.in', section: 'IT A' },
  { roll_no: '014', register_no: '3122255002014', full_name: 'Aradhana P', email: 'aradhana2510137@ssn.edu.in', section: 'IT A' },
  { roll_no: '015', register_no: '3122255002015', full_name: 'Aravind S', email: 'aravind2510777@ssn.edu.in', section: 'IT A' },
  { roll_no: '016', register_no: '3122255002016', full_name: 'Architha R', email: 'architha2510159@ssn.edu.in', section: 'IT A' },
  { roll_no: '017', register_no: '3122255002017', full_name: 'Arunachalam S', email: 'arunachalam2510988@ssn.edu.in', section: 'IT A' },
  { roll_no: '018', register_no: '3122255002018', full_name: 'Arvindh Vijay G', email: 'arvindhvijay2510174@ssn.edu.in', section: 'IT A' },
  { roll_no: '019', register_no: '3122255002019', full_name: 'Ashwin K B', email: 'ashwin2510852@ssn.edu.in', section: 'IT A' },
  { roll_no: '020', register_no: '3122255002020', full_name: 'Bavadharani S', email: 'bavadharani2510664@ssn.edu.in', section: 'IT A' },
  { roll_no: '021', register_no: '3122255002021', full_name: 'Benita Mary Alwin', email: 'benitamary2510020@ssn.edu.in', section: 'IT A' },
  { roll_no: '022', register_no: '3122255002022', full_name: 'Charan V', email: 'charan2510151@ssn.edu.in', section: 'IT A' },
  { roll_no: '023', register_no: '3122255002023', full_name: 'Chris Bastian Roy', email: 'chris2510063@ssn.edu.in', section: 'IT A' },
  { roll_no: '024', register_no: '3122255002024', full_name: 'Dafna Delvis', email: 'dafna2510001@ssn.edu.in', section: 'IT A' },

  // Page 2 (25 to 51) -> IT A
  { roll_no: '025', register_no: '3122255002025', full_name: 'Deepika Senthilnathan', email: 'deepika2510041@ssn.edu.in', section: 'IT A' },
  { roll_no: '026', register_no: '3122255002026', full_name: 'Dhanvanth J M', email: 'dhanvanth2510550@ssn.edu.in', section: 'IT A' },
  { roll_no: '027', register_no: '3122255002027', full_name: 'Dharanidharan J', email: 'dharanidharan2510630@ssn.edu.in', section: 'IT A' },
  { roll_no: '028', register_no: '3122255002028', full_name: 'Dharshan R', email: 'dharshan2510163@ssn.edu.in', section: 'IT A' },
  { roll_no: '029', register_no: '3122255002029', full_name: 'Dharshan Sathish Kumar', email: 'dharshan2510406@ssn.edu.in', section: 'IT A' },
  { roll_no: '030', register_no: '3122255002030', full_name: 'Dharshini P K', email: 'dharshini2510905@ssn.edu.in', section: 'IT A' },
  { roll_no: '031', register_no: '3122255002031', full_name: 'Dhesh Sarvajith R', email: 'dheshsarvajith2510414@ssn.edu.in', section: 'IT A' },
  { roll_no: '032', register_no: '3122255002032', full_name: 'Divasundar S', email: 'divasundar2510422@ssn.edu.in', section: 'IT A' },
  { roll_no: '033', register_no: '3122255002033', full_name: 'Elamathi B', email: 'elamathi2510921@ssn.edu.in', section: 'IT A' },
  { roll_no: '034', register_no: '3122255002034', full_name: 'Eniya Sree K', email: 'eniyasree2510134@ssn.edu.in', section: 'IT A' },
  { roll_no: '035', register_no: '3122255002035', full_name: 'Faizal I', email: 'faizal2510834@ssn.edu.in', section: 'IT A' },
  { roll_no: '036', register_no: '3122255002036', full_name: 'Gokul Prasanth A', email: 'gokulprasanth2510740@ssn.edu.in', section: 'IT A' },
  { roll_no: '037', register_no: '3122255002037', full_name: 'Gokula Hari Rajan R', email: 'gokulaharirajan2510160@ssn.edu.in', section: 'IT A' },
  { roll_no: '038', register_no: '3122255002038', full_name: 'Guru K', email: 'guru2510817@ssn.edu.in', section: 'IT A' },
  { roll_no: '039', register_no: '3122255002039', full_name: 'Guru Prasath N', email: 'guruprasath2510871@ssn.edu.in', section: 'IT A' },
  { roll_no: '040', register_no: '3122255002040', full_name: 'Haridass C', email: 'haridass2510845@ssn.edu.in', section: 'IT A' },
  { roll_no: '041', register_no: '3122255002041', full_name: 'Hariharan G', email: 'hariharan2510689@ssn.edu.in', section: 'IT A' },
  { roll_no: '042', register_no: '3122255002042', full_name: 'Harini Bharadwaj', email: 'harini2510402@ssn.edu.in', section: 'IT A' },
  { roll_no: '043', register_no: '3122255002043', full_name: 'Harini Devi B', email: 'harinidevi2510156@ssn.edu.in', section: 'IT A' },
  { roll_no: '044', register_no: '3122255002044', full_name: 'Harini V', email: 'harini2510128@ssn.edu.in', section: 'IT A' },
  { roll_no: '045', register_no: '3122255002045', full_name: 'Harish S', email: 'harish2510140@ssn.edu.in', section: 'IT A' },
  { roll_no: '046', register_no: '3122255002046', full_name: 'Harishraam R', email: 'harishraam2510230@ssn.edu.in', section: 'IT A' },
  { roll_no: '047', register_no: '3122255002047', full_name: 'Harshini A', email: 'harshini2510438@ssn.edu.in', section: 'IT A' },
  { roll_no: '048', register_no: '3122255002048', full_name: 'Harshini N T', email: 'harshini2510712@ssn.edu.in', section: 'IT A' },
  { roll_no: '049', register_no: '3122255002049', full_name: 'Hemanya D', email: 'hemanya2510408@ssn.edu.in', section: 'IT A' },
  { roll_no: '050', register_no: '3122255002050', full_name: 'Hrishikesh G', email: 'hrishikesh2510359@ssn.edu.in', section: 'IT A' },
  { roll_no: '051', register_no: '3122255002051', full_name: 'Hubert Bala Joshwin D', email: 'hubertbalajoshwin2510407@ssn.edu.in', section: 'IT A' },

  // Page 3 (52 to 71) -> IT A
  { roll_no: '052', register_no: '3122255002052', full_name: 'Jeeva K', email: 'jeeva2510573@ssn.edu.in', section: 'IT A' },
  { roll_no: '053', register_no: '3122255002053', full_name: 'Kathir V', email: 'kathir2510910@ssn.edu.in', section: 'IT A' },
  { roll_no: '054', register_no: '3122255002054', full_name: 'Kewinsanjai M', email: 'kewinsanjai2510982@ssn.edu.in', section: 'IT A' },
  { roll_no: '055', register_no: '3122255002055', full_name: 'Kishore S B', email: 'kishore2510759@ssn.edu.in', section: 'IT A' },
  { roll_no: '056', register_no: '3122255002056', full_name: 'Kruthika C D', email: 'kruthika2510123@ssn.edu.in', section: 'IT A' },
  { roll_no: '057', register_no: '3122255002057', full_name: 'Lakchitha A', email: 'lakchitha2510591@ssn.edu.in', section: 'IT A' },
  { roll_no: '058', register_no: '3122255002058', full_name: 'Ligitha S', email: 'ligitha2510956@ssn.edu.in', section: 'IT A' },
  { roll_no: '059', register_no: '3122255002059', full_name: 'Madhu Mitha S', email: 'madhumitha2510447@ssn.edu.in', section: 'IT A' },
  { roll_no: '060', register_no: '3122255002060', full_name: 'Madhuvarshini S', email: 'madhuvarshini2510934@ssn.edu.in', section: 'IT A' },
  { roll_no: '061', register_no: '3122255002061', full_name: 'Madumika R P', email: 'madumika2510572@ssn.edu.in', section: 'IT A' },
  { roll_no: '062', register_no: '3122255002062', full_name: 'Malavi V', email: 'malavi2510044@ssn.edu.in', section: 'IT A' },
  { roll_no: '063', register_no: '3122255002063', full_name: 'Maria Rotric Loran L', email: 'mariarotricloran2510813@ssn.edu.in', section: 'IT A' },
  { roll_no: '064', register_no: '3122255002064', full_name: 'Mathesh S', email: 'mathesh2510855@ssn.edu.in', section: 'IT A' },
  { roll_no: '065', register_no: '3122255002065', full_name: 'Menaga M', email: 'menaga2510932@ssn.edu.in', section: 'IT A' },
  { roll_no: '066', register_no: '3122255002066', full_name: 'Mirthula S Fernando', email: 'mirthula2510171@ssn.edu.in', section: 'IT A' },
  { roll_no: '067', register_no: '3122255002067', full_name: 'Mithin Krishna P S', email: 'mithinkrishna2510417@ssn.edu.in', section: 'IT A' },
  { roll_no: '068', register_no: '3122255002068', full_name: 'Mohamed Rafith A', email: 'mohamedrafith2510714@ssn.edu.in', section: 'IT A' },
  { roll_no: '069', register_no: '3122255002069', full_name: 'Mohammed Aadhil J', email: 'mohammedaadhil2510844@ssn.edu.in', section: 'IT A' },
  { roll_no: '070', register_no: '3122255002070', full_name: 'Mohammed Noorul Islam V P', email: 'mohammednoorulislam2510850@ssn.edu.in', section: 'IT A' },
  { roll_no: '071', register_no: '3122255002071', full_name: 'Mohana Prasath S', email: 'mohanaprasath2510700@ssn.edu.in', section: 'IT A' },

  // Page 3-6 (72 to 141) -> IT B
  { roll_no: '072', register_no: '3122255002072', full_name: 'Mohith Priyan Balasubramanian', email: 'mohithpriyan2511072@ssn.edu.in', section: 'IT B' },
  { roll_no: '073', register_no: '3122255002073', full_name: 'Mukesh K', email: 'mukesh2510969@ssn.edu.in', section: 'IT B' },
  { roll_no: '074', register_no: '3122255002074', full_name: 'Mukundhan K', email: 'mukundhan2510147@ssn.edu.in', section: 'IT B' },
  { roll_no: '075', register_no: '3122255002075', full_name: 'Nagammai A', email: 'nagammai2510771@ssn.edu.in', section: 'IT B' },
  { roll_no: '076', register_no: '3122255002076', full_name: 'Namish Kadiyala', email: 'namish2510037@ssn.edu.in', section: 'IT B' },
  { roll_no: '077', register_no: '3122255002077', full_name: 'Nehaa M S', email: 'nehaa2510894@ssn.edu.in', section: 'IT B' },
  { roll_no: '078', register_no: '3122255002078', full_name: 'Nihitha S', email: 'nihitha2510860@ssn.edu.in', section: 'IT B' },
  { roll_no: '079', register_no: '3122255002079', full_name: 'Nikila G', email: 'nikila2510627@ssn.edu.in', section: 'IT B' },
  { roll_no: '080', register_no: '3122255002080', full_name: 'Nishanth S', email: 'nishanth2510830@ssn.edu.in', section: 'IT B' },
  { roll_no: '081', register_no: '3122255002081', full_name: 'Nithilaa R', email: 'nithilaa2510862@ssn.edu.in', section: 'IT B' },
  { roll_no: '082', register_no: '3122255002082', full_name: 'Nitinraj S', email: 'nitinraj2510127@ssn.edu.in', section: 'IT B' },
  { roll_no: '083', register_no: '3122255002083', full_name: 'Parvathi P R', email: 'parvathi2510843@ssn.edu.in', section: 'IT B' },
  { roll_no: '084', register_no: '3122255002084', full_name: 'Pavithra S S M', email: 'pavithra2510428@ssn.edu.in', section: 'IT B' },
  { roll_no: '085', register_no: '3122255002085', full_name: 'Pradeep V', email: 'pradeep2510436@ssn.edu.in', section: 'IT B' },
  { roll_no: '086', register_no: '3122255002086', full_name: 'Pranaya Shree S', email: 'pranayashree2510432@ssn.edu.in', section: 'IT B' },
  { roll_no: '087', register_no: '3122255002087', full_name: 'Preetha A', email: 'preetha2510861@ssn.edu.in', section: 'IT B' },
  { roll_no: '088', register_no: '3122255002088', full_name: 'Prithivi S K', email: 'prithivi2510441@ssn.edu.in', section: 'IT B' },
  { roll_no: '089', register_no: '3122255002089', full_name: 'Priya V', email: 'priya2510781@ssn.edu.in', section: 'IT B' },
  { roll_no: '090', register_no: '3122255002090', full_name: 'Priyadharshni S', email: 'priyadharshni2510933@ssn.edu.in', section: 'IT B' },
  { roll_no: '091', register_no: '3122255002091', full_name: 'Rachel Jacob', email: 'rachel2510004@ssn.edu.in', section: 'IT B' },
  { roll_no: '092', register_no: '3122255002092', full_name: 'Raghav Karthick', email: 'raghav2510162@ssn.edu.in', section: 'IT B' },
  { roll_no: '093', register_no: '3122255002093', full_name: 'Ranjitha P', email: 'ranjitha2510175@ssn.edu.in', section: 'IT B' },
  { roll_no: '094', register_no: '3122255002094', full_name: 'Ravivarman M', email: 'ravivarman2510681@ssn.edu.in', section: 'IT B' },
  { roll_no: '095', register_no: '3122255002095', full_name: 'Renuka Varshini K', email: 'renukavarshini2510620@ssn.edu.in', section: 'IT B' },
  { roll_no: '096', register_no: '3122255002096', full_name: 'Ritheeshkumar S', email: 'ritheeshkumar2510148@ssn.edu.in', section: 'IT B' },
  { roll_no: '097', register_no: '3122255002097', full_name: 'Rithishsaran T K', email: 'rithishsaran2510907@ssn.edu.in', section: 'IT B' },
  { roll_no: '098', register_no: '3122255002098', full_name: 'Rohit Ram B', email: 'rohitram2510448@ssn.edu.in', section: 'IT B' },
  { roll_no: '099', register_no: '3122255002099', full_name: 'Rohit S', email: 'rohit2510076@ssn.edu.in', section: 'IT B' },
  { roll_no: '100', register_no: '3122255002100', full_name: 'Rufhus Christopher R', email: 'rufhuschristopher2510875@ssn.edu.in', section: 'IT B' },
  { roll_no: '101', register_no: '3122255002101', full_name: 'Rupak K', email: 'rupak2510141@ssn.edu.in', section: 'IT B' },
  { roll_no: '102', register_no: '3122255002102', full_name: 'Ruthvika V', email: 'ruthvika2510138@ssn.edu.in', section: 'IT B' },
  { roll_no: '103', register_no: '3122255002103', full_name: 'Sachit Ram M', email: 'sachit2510791@ssn.edu.in', section: 'IT B' },
  { roll_no: '104', register_no: '3122255002104', full_name: 'Sahana S', email: 'sahana2510145@ssn.edu.in', section: 'IT B' },
  { roll_no: '105', register_no: '3122255002105', full_name: 'Saketh Ram Srinivasan', email: 'sakethram2510196@ssn.edu.in', section: 'IT B' },
  { roll_no: '106', register_no: '3122255002106', full_name: 'Sakthi V', email: 'sakthi2510959@ssn.edu.in', section: 'IT B' },
  { roll_no: '107', register_no: '3122255002107', full_name: 'Sanjay S', email: 'sanjay2510208@ssn.edu.in', section: 'IT B' },
  { roll_no: '108', register_no: '3122255002108', full_name: 'Santhosh P S', email: 'santhosh2510662@ssn.edu.in', section: 'IT B' },
  { roll_no: '109', register_no: '3122255002109', full_name: 'Sasikumar R', email: 'sasikumar2510766@ssn.edu.in', section: 'IT B' },
  { roll_no: '110', register_no: '3122255002110', full_name: 'Shaahir Meeran Mohaideen M I', email: 'shaahirmeeranmohaideen2510883@ssn.edu.in', section: 'IT B' },
  { roll_no: '111', register_no: '3122255002111', full_name: 'Shafrin Sahaana S', email: 'shafrinsahaana2510204@ssn.edu.in', section: 'IT B' },
  { roll_no: '112', register_no: '3122255002112', full_name: 'Shivani K S', email: 'shivani2510142@ssn.edu.in', section: 'IT B' },
  { roll_no: '113', register_no: '3122255002113', full_name: 'Shivani V', email: 'shivani2510892@ssn.edu.in', section: 'IT B' },
  { roll_no: '114', register_no: '3122255002114', full_name: 'Shravan Rao', email: 'shravan2510064@ssn.edu.in', section: 'IT B' },
  { roll_no: '115', register_no: '3122255002115', full_name: 'Shreshta A', email: 'shreshta2510430@ssn.edu.in', section: 'IT B' },
  { roll_no: '116', register_no: '3122255002116', full_name: 'Shweta Mary John', email: 'shwetamary2510132@ssn.edu.in', section: 'IT B' },
  { roll_no: '117', register_no: '3122255002117', full_name: 'Siva S', email: 'siva2510575@ssn.edu.in', section: 'IT B' },
  { roll_no: '118', register_no: '3122255002118', full_name: 'Sivaprabhu S', email: 'sivaprabhu2510193@ssn.edu.in', section: 'IT B' },
  { roll_no: '119', register_no: '3122255002119', full_name: 'Soumiya S', email: 'soumiya2510812@ssn.edu.in', section: 'IT B' },
  { roll_no: '120', register_no: '3122255002120', full_name: 'Sri Dhanvanth P', email: 'sridhanvanth2510715@ssn.edu.in', section: 'IT B' },
  { roll_no: '121', register_no: '3122255002121', full_name: 'Srinivetha V', email: 'srinivetha2510400@ssn.edu.in', section: 'IT B' },
  { roll_no: '122', register_no: '3122255002122', full_name: 'Stefania E', email: 'stefania2510161@ssn.edu.in', section: 'IT B' },
  { roll_no: '123', register_no: '3122255002123', full_name: 'Steve Winston G', email: 'stevewinston2510016@ssn.edu.in', section: 'IT B' },
  { roll_no: '124', register_no: '3122255002124', full_name: 'Subha Shree R K', email: 'subhashree2510442@ssn.edu.in', section: 'IT B' },
  { roll_no: '125', register_no: '3122255002125', full_name: 'Subhasaravanan G', email: 'subhasaravanan2510758@ssn.edu.in', section: 'IT B' },
  { roll_no: '126', register_no: '3122255002126', full_name: 'Sujeetha S', email: 'sujeetha2510757@ssn.edu.in', section: 'IT B' },
  { roll_no: '127', register_no: '3122255002127', full_name: 'Sushil P', email: 'sushil2510122@ssn.edu.in', section: 'IT B' },
  { roll_no: '128', register_no: '3122255002128', full_name: 'Susidharan S', email: 'susidharan2510746@ssn.edu.in', section: 'IT B' },
  { roll_no: '129', register_no: '3122255002129', full_name: 'Tarrun M', email: 'tarrun2510155@ssn.edu.in', section: 'IT B' },
  { roll_no: '130', register_no: '3122255002130', full_name: 'Tejaavarshini E', email: 'tejaavarshini2510619@ssn.edu.in', section: 'IT B' },
  { roll_no: '131', register_no: '3122255002131', full_name: 'Tharika S', email: 'tharika2510117@ssn.edu.in', section: 'IT B' },
  { roll_no: '132', register_no: '3122255002132', full_name: 'Thejesh J', email: 'thejesh2510699@ssn.edu.in', section: 'IT B' },
  { roll_no: '133', register_no: '3122255002133', full_name: 'Vaibhav Ramesh', email: 'vaibhav2510150@ssn.edu.in', section: 'IT B' },
  { roll_no: '134', register_no: '3122255002134', full_name: 'Varshana M', email: 'varshana2510767@ssn.edu.in', section: 'IT B' },
  { roll_no: '135', register_no: '3122255002135', full_name: 'Vidya Varuni R', email: 'vidyavaruni2570011@ssn.edu.in', section: 'IT B' },
  { roll_no: '136', register_no: '3122255002136', full_name: 'Vignesh M', email: 'vignesh2510990@ssn.edu.in', section: 'IT B' },
  { roll_no: '137', register_no: '3122255002137', full_name: 'Vinu Shreshta Ganesan', email: 'vinushreshta2510567@ssn.edu.in', section: 'IT B' },
  { roll_no: '138', register_no: '3122255002138', full_name: 'Vishwa R', email: 'vishwa2510808@ssn.edu.in', section: 'IT B' },
  { roll_no: '139', register_no: '3122255002139', full_name: 'Yanush Jayakumar', email: 'yanush2510067@ssn.edu.in', section: 'IT B' },
  { roll_no: '140', register_no: '3122255002140', full_name: 'Yashwanth A', email: 'yashwanth2510445@ssn.edu.in', section: 'IT B' },
  { roll_no: '141', register_no: '3122255002141', full_name: 'Yazhini K', email: 'yazhini2510809@ssn.edu.in', section: 'IT B' }
];

async function seed() {
  console.log('🚀 Seeding SSN IT 2025 Database via Supabase Client...');

  // 1. Department
  const { data: dept, error: dErr } = await supabase
    .from('departments')
    .upsert({ id: '11111111-2222-3333-4444-555555555555', name: 'Information Technology', code: 'IT' })
    .select()
    .single();
  if (dErr) console.error('Department error:', dErr);
  else console.log('✓ Department: Information Technology (IT)');

  // 2. Class
  const { data: cls, error: cErr } = await supabase
    .from('classes')
    .upsert({
      id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      department_id: '11111111-2222-3333-4444-555555555555',
      name: 'B.Tech IT - 2025 Batch',
      code: 'IT-2025',
      year: 1,
      semester: 1
    })
    .select()
    .single();
  if (cErr) console.error('Class error:', cErr);
  else console.log('✓ Class: B.Tech IT - 2025 Batch');

  // 3. Sections: IT A and IT B
  const { error: sErr } = await supabase
    .from('sections')
    .upsert([
      { id: '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', class_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', name: 'IT A' },
      { id: '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', class_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', name: 'IT B' }
    ]);
  if (sErr) console.error('Sections error:', sErr);
  else console.log('✓ Sections: IT A and IT B created');

  // 4. Subject: Introduction to Digital Communications
  const { error: subErr } = await supabase
    .from('subjects')
    .upsert({
      id: '33333333-cccc-cccc-cccc-cccccccccccc',
      name: 'Introduction to Digital Communications',
      code: 'IDC101',
      department_id: '11111111-2222-3333-4444-555555555555',
      semester: 1
    });
  if (subErr) console.error('Subject error:', subErr);
  else console.log('✓ Subject: Introduction to Digital Communications');

  // 5. Teacher Profile for Dr. Arige Sumanth
  const teacherId = '947c656b-84e9-41b4-8ebe-57ee2ffb1e8e';
  await supabase.from('profiles').upsert({
    id: teacherId,
    email: 'arigesumanth@gmail.com',
    full_name: 'Dr. Arige Sumanth',
    role: 'teacher',
    department: 'Information Technology'
  });
  console.log('✓ Profile: Dr. Arige Sumanth (arigesumanth@gmail.com)');

  // 6. Timetable (6 Periods for Dr. Arige Sumanth)
  const timetableSlots = [
    // IT A: Tue P5, Thu P2, Fri P2
    { id: '10000000-0000-0000-0000-000000000001', class_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', section_id: '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', subject_id: '33333333-cccc-cccc-cccc-cccccccccccc', teacher_id: teacherId, day_of_week: 2, period_number: 5, start_time: '14:00:00', end_time: '15:00:00', room_no: 'IT Hall 201' },
    { id: '10000000-0000-0000-0000-000000000002', class_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', section_id: '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', subject_id: '33333333-cccc-cccc-cccc-cccccccccccc', teacher_id: teacherId, day_of_week: 4, period_number: 2, start_time: '10:00:00', end_time: '11:00:00', room_no: 'IT Hall 201' },
    { id: '10000000-0000-0000-0000-000000000003', class_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', section_id: '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', subject_id: '33333333-cccc-cccc-cccc-cccccccccccc', teacher_id: teacherId, day_of_week: 5, period_number: 2, start_time: '10:00:00', end_time: '11:00:00', room_no: 'IT Hall 201' },
    // IT B: Mon P1, Tue P3, Fri P6
    { id: '20000000-0000-0000-0000-000000000001', class_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', section_id: '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', subject_id: '33333333-cccc-cccc-cccc-cccccccccccc', teacher_id: teacherId, day_of_week: 1, period_number: 1, start_time: '09:00:00', end_time: '10:00:00', room_no: 'IT Hall 202' },
    { id: '20000000-0000-0000-0000-000000000002', class_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', section_id: '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', subject_id: '33333333-cccc-cccc-cccc-cccccccccccc', teacher_id: teacherId, day_of_week: 2, period_number: 3, start_time: '11:30:00', end_time: '12:30:00', room_no: 'IT Hall 202' },
    { id: '20000000-0000-0000-0000-000000000003', class_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', section_id: '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', subject_id: '33333333-cccc-cccc-cccc-cccccccccccc', teacher_id: teacherId, day_of_week: 5, period_number: 6, start_time: '15:00:00', end_time: '16:00:00', room_no: 'IT Hall 202' }
  ];

  const { error: ttErr } = await supabase.from('timetables').upsert(timetableSlots);
  if (ttErr) console.error('Timetable insert error:', ttErr);
  else console.log('✓ Timetable: 6 periods created for Dr. Arige Sumanth');

  // 7. Students (All 141 students)
  const studentsToInsert = studentsData.map((s) => ({
    register_no: s.register_no,
    roll_no: s.roll_no,
    full_name: s.full_name,
    email: s.email,
    class_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    section_id: s.section === 'IT A' ? '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa' : '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    is_active: true
  }));

  const { error: stdErr } = await supabase
    .from('students')
    .upsert(studentsToInsert, { onConflict: 'register_no' });

  if (stdErr) console.error('Students insert error:', stdErr);
  else console.log(`✓ Students: Successfully inserted/updated all ${studentsToInsert.length} students (IT A: 71, IT B: 70)!`);

  console.log('🎉 Seeding completed successfully!');
}

seed();
