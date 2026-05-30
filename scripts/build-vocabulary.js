#!/usr/bin/env node
/**
 * Generate vocabulary skills, lessons, and questions for all SGK units (grades 6–9).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const SOURCE =
  "Bám sát từ vựng SGK Global Success (Kết nối tri thức với cuộc sống) theo từng Unit.";

/** @type {Array<{grade:number,chapterIndex:number,chapter:string,book:string,words:Array<{en:string,vi:string,example?:string}>}>} */
const PACKS = [
  // Grade 6
  {
    grade: 6, chapterIndex: 1, chapter: "Unit 1: My new school", book: "Tập 1",
    words: [
      { en: "classroom", vi: "phòng học", example: "Our classroom is on the second floor." },
      { en: "subject", vi: "môn học", example: "Math is my favourite subject." },
      { en: "uniform", vi: "đồng phục", example: "Students must wear a uniform." },
      { en: "laboratory", vi: "phòng thí nghiệm", example: "We do experiments in the laboratory." },
      { en: "canteen", vi: "căng tin", example: "We have lunch in the canteen." },
      { en: "playground", vi: "sân chơi", example: "Children play in the playground." },
      { en: "timetable", vi: "thời khóa biểu", example: "Check the timetable for tomorrow." },
      { en: "break time", vi: "giờ ra chơi", example: "We chat during break time." }
    ]
  },
  {
    grade: 6, chapterIndex: 2, chapter: "Unit 2: My house", book: "Tập 1",
    words: [
      { en: "living room", vi: "phòng khách", example: "We watch TV in the living room." },
      { en: "bedroom", vi: "phòng ngủ", example: "My bedroom is small but cosy." },
      { en: "kitchen", vi: "nhà bếp", example: "Mum is cooking in the kitchen." },
      { en: "balcony", vi: "ban công", example: "There are flowers on the balcony." },
      { en: "attic", vi: "gác mái", example: "We store old boxes in the attic." },
      { en: "furniture", vi: "đồ nội thất", example: "The furniture is made of wood." },
      { en: "appliance", vi: "thiết bị gia dụng", example: "The kitchen has modern appliances." },
      { en: "bathroom", vi: "phòng tắm", example: "The bathroom is next to my room." }
    ]
  },
  {
    grade: 6, chapterIndex: 3, chapter: "Unit 3: My friends", book: "Tập 1",
    words: [
      { en: "generous", vi: "hào phóng", example: "She is generous with her time." },
      { en: "humorous", vi: "hài hước", example: "He tells humorous stories." },
      { en: "caring", vi: "chu đáo, quan tâm", example: "A caring friend listens to you." },
      { en: "reserved", vi: "kín đáo", example: "He is quiet and reserved." },
      { en: "sociable", vi: "hòa đồng", example: "She is sociable and friendly." },
      { en: "appearance", vi: "ngoại hình", example: "Don't judge people by appearance." },
      { en: "character", vi: "tính cách", example: "Honesty is part of his character." },
      { en: "active", vi: "năng động", example: "Active students join many clubs." }
    ]
  },
  {
    grade: 6, chapterIndex: 4, chapter: "Unit 4: My neighbourhood", book: "Tập 1",
    words: [
      { en: "bakery", vi: "tiệm bánh", example: "I buy bread at the bakery." },
      { en: "bookstore", vi: "hiệu sách", example: "The bookstore opens at 8 a.m." },
      { en: "traffic light", vi: "đèn giao thông", example: "Stop at the red traffic light." },
      { en: "peaceful", vi: "yên bình", example: "Our street is peaceful at night." },
      { en: "bustling", vi: "nhộn nhịp", example: "The market is bustling on Sundays." },
      { en: "polluted", vi: "bị ô nhiễm", example: "The river looks polluted." },
      { en: "corner", vi: "góc phố", example: "Turn left at the corner." },
      { en: "park", vi: "công viên", example: "We walk in the park every evening." }
    ]
  },
  {
    grade: 6, chapterIndex: 5, chapter: "Unit 5: Natural wonders of Viet Nam", book: "Tập 1",
    words: [
      { en: "waterfall", vi: "thác nước", example: "Ban Gioc waterfall is spectacular." },
      { en: "cave", vi: "hang động", example: "We explored a limestone cave." },
      { en: "desert", vi: "sa mạc", example: "It is hot and dry in the desert." },
      { en: "valley", vi: "thung lũng", example: "Rice grows in the valley." },
      { en: "landscape", vi: "phong cảnh", example: "The landscape is breathtaking." },
      { en: "spectacular", vi: "ngoạn mục", example: "Ha Long Bay is spectacular." },
      { en: "breathtaking", vi: "đẹp đến nghẹt thở", example: "The view from the top is breathtaking." },
      { en: "plateau", vi: "cao nguyên", example: "Da Lat lies on a plateau." }
    ]
  },
  {
    grade: 6, chapterIndex: 6, chapter: "Unit 6: Our Tet holiday", book: "Tập 1",
    words: [
      { en: "peach blossom", vi: "hoa đào", example: "Peach blossom is common in the North." },
      { en: "apricot blossom", vi: "hoa mai", example: "Apricot blossom blooms in the South." },
      { en: "lion dance", vi: "múa lân", example: "We enjoy the lion dance on Tet." },
      { en: "tradition", vi: "truyền thống", example: "Tet is an important tradition." },
      { en: "reunion", vi: "đoàn tụ", example: "Tet is a time for family reunion." },
      { en: "celebrate", vi: "ăn mừng", example: "We celebrate Tet with relatives." },
      { en: "folk song", vi: "dân ca", example: "Grandma sings folk songs." },
      { en: "decoration", vi: "đồ trang trí", example: "The house has bright decorations." }
    ]
  },
  {
    grade: 6, chapterIndex: 7, chapter: "Unit 7: Television", book: "Tập 1",
    words: [
      { en: "cartoon", vi: "phim hoạt hình", example: "Children love watching cartoons." },
      { en: "documentary", vi: "phim tài liệu", example: "The documentary is about wildlife." },
      { en: "quiz show", vi: "gameshow trắc nghiệm", example: "We watch a quiz show on Sunday." },
      { en: "remote control", vi: "điều khiển từ xa", example: "Pass me the remote control." },
      { en: "channel", vi: "kênh truyền hình", example: "Which channel is the news on?" },
      { en: "programme", vi: "chương trình", example: "This programme starts at 7 p.m." },
      { en: "viewer", vi: "người xem", example: "The show has millions of viewers." },
      { en: "entertainment", vi: "giải trí", example: "TV is a form of entertainment." }
    ]
  },
  {
    grade: 6, chapterIndex: 8, chapter: "Unit 8: Sports and games", book: "Tập 1",
    words: [
      { en: "athlete", vi: "vận động viên", example: "The athlete trains every day." },
      { en: "coach", vi: "huấn luyện viên", example: "Our coach is very strict." },
      { en: "referee", vi: "trọng tài", example: "The referee stopped the game." },
      { en: "spectator", vi: "khán giả (người xem)", example: "Spectators cheered loudly." },
      { en: "competition", vi: "cuộc thi", example: "She won the swimming competition." },
      { en: "gymnastics", vi: "thể dục dụng cụ", example: "Gymnastics requires flexibility." },
      { en: "volleyball", vi: "bóng chuyền", example: "We play volleyball after school." },
      { en: "martial arts", vi: "võ thuật", example: "He learns martial arts twice a week." }
    ]
  },
  {
    grade: 6, chapterIndex: 9, chapter: "Unit 9: Cities of the world", book: "Tập 2",
    words: [
      { en: "skyscraper", vi: "nhà chọc trời", example: "Tokyo has many skyscrapers." },
      { en: "suburb", vi: "ngoại ô", example: "They live in a quiet suburb." },
      { en: "landmark", vi: "địa danh nổi tiếng", example: "The Eiffel Tower is a famous landmark." },
      { en: "metropolis", vi: "đô thị lớn", example: "London is a busy metropolis." },
      { en: "crowded", vi: "đông đúc", example: "The subway is crowded at rush hour." },
      { en: "pollution", vi: "ô nhiễm", example: "Air pollution is a serious problem." },
      { en: "residential", vi: "dân cư", example: "This is a residential area." },
      { en: "commercial", vi: "thương mại", example: "The commercial district has many shops." }
    ]
  },
  {
    grade: 6, chapterIndex: 10, chapter: "Unit 10: Our houses in the future", book: "Tập 2",
    words: [
      { en: "solar panel", vi: "tấm pin mặt trời", example: "Solar panels save energy." },
      { en: "robot", vi: "robot", example: "A robot can clean the house." },
      { en: "automatic", vi: "tự động", example: "The door is automatic." },
      { en: "spacious", vi: "rộng rãi", example: "Future homes will be spacious." },
      { en: "modern", vi: "hiện đại", example: "They want a modern kitchen." },
      { en: "smart home", vi: "nhà thông minh", example: "A smart home uses technology." },
      { en: "elevator", vi: "thang máy", example: "Take the elevator to the tenth floor." },
      { en: "rooftop", vi: "sân thượng", example: "We grow vegetables on the rooftop." }
    ]
  },
  {
    grade: 6, chapterIndex: 11, chapter: "Unit 11: Our greener world", book: "Tập 2",
    words: [
      { en: "recycle", vi: "tái chế", example: "We recycle paper and plastic." },
      { en: "endangered", vi: "bị đe dọa", example: "Tigers are endangered animals." },
      { en: "habitat", vi: "môi trường sống", example: "Forests are the habitat of many birds." },
      { en: "deforestation", vi: "phá rừng", example: "Deforestation destroys habitats." },
      { en: "renewable", vi: "tái tạo được", example: "Solar energy is renewable." },
      { en: "conserve", vi: "bảo tồn", example: "We must conserve water." },
      { en: "sustainable", vi: "bền vững", example: "Sustainable living protects the planet." },
      { en: "wildlife", vi: "động vật hoang dã", example: "The park protects local wildlife." }
    ]
  },
  {
    grade: 6, chapterIndex: 12, chapter: "Unit 12: Robots", book: "Tập 2",
    words: [
      { en: "artificial intelligence", vi: "trí tuệ nhân tạo", example: "AI helps robots learn." },
      { en: "humanoid", vi: "người máy", example: "A humanoid robot looks like a person." },
      { en: "sensor", vi: "cảm biến", example: "The robot uses sensors to move." },
      { en: "automation", vi: "tự động hóa", example: "Automation makes factories faster." },
      { en: "invention", vi: "phát minh", example: "The telephone was a great invention." },
      { en: "technician", vi: "kỹ thuật viên", example: "A technician repairs the machine." },
      { en: "operate", vi: "vận hành", example: "Can you operate this robot?" },
      { en: "programmable", vi: "có thể lập trình", example: "Programmable toys are popular." }
    ]
  },
  // Grade 7
  {
    grade: 7, chapterIndex: 1, chapter: "Unit 1: Hobbies", book: "Tập 1",
    words: [
      { en: "collecting", vi: "sưu tầm", example: "Collecting stamps is my hobby." },
      { en: "origami", vi: "gấp giấy Nhật Bản", example: "She enjoys doing origami." },
      { en: "gardening", vi: "làm vườn", example: "Gardening helps me relax." },
      { en: "knitting", vi: "đan len", example: "My grandma loves knitting." },
      { en: "leisure", vi: "thời gian rảnh", example: "I read books in my leisure time." },
      { en: "creative", vi: "sáng tạo", example: "Painting is a creative hobby." },
      { en: "portrait", vi: "chân dung", example: "He draws portraits of his friends." },
      { en: "take up", vi: "bắt đầu (sở thích)", example: "I want to take up cycling." }
    ]
  },
  {
    grade: 7, chapterIndex: 2, chapter: "Unit 2: Healthy living", book: "Tập 1",
    words: [
      { en: "balanced diet", vi: "chế độ ăn cân bằng", example: "A balanced diet keeps you healthy." },
      { en: "nutritious", vi: "bổ dưỡng", example: "Vegetables are nutritious food." },
      { en: "junk food", vi: "đồ ăn vặt không lành mạnh", example: "Avoid too much junk food." },
      { en: "exercise", vi: "tập thể dục", example: "Exercise improves your health." },
      { en: "obesity", vi: "béo phì", example: "Obesity can cause health problems." },
      { en: "hydration", vi: "bổ sung nước", example: "Good hydration is important in summer." },
      { en: "well-being", vi: "sức khỏe tổng thể", example: "Sleep affects your well-being." },
      { en: "lifestyle", vi: "lối sống", example: "A healthy lifestyle includes sport." }
    ]
  },
  {
    grade: 7, chapterIndex: 3, chapter: "Unit 3: Community service", book: "Tập 1",
    words: [
      { en: "volunteer", vi: "tình nguyện viên", example: "She works as a volunteer." },
      { en: "charity", vi: "từ thiện", example: "They raised money for charity." },
      { en: "donate", vi: "quyên góp", example: "We donate clothes to poor families." },
      { en: "elderly", vi: "người cao tuổi", example: "Students visit the elderly." },
      { en: "orphanage", vi: "trại trẻ mồ côi", example: "We sang songs at the orphanage." },
      { en: "community", vi: "cộng đồng", example: "Community service helps society." },
      { en: "fundraising", vi: "gây quỹ", example: "The school organised a fundraising event." },
      { en: "supportive", vi: "hỗ trợ, giúp đỡ", example: "Our neighbours are very supportive." }
    ]
  },
  {
    grade: 7, chapterIndex: 4, chapter: "Unit 4: Music and arts", book: "Tập 1",
    words: [
      { en: "orchestra", vi: "dàn nhạc giao hưởng", example: "The orchestra played beautifully." },
      { en: "exhibition", vi: "triển lãm", example: "We visited an art exhibition." },
      { en: "sculpture", vi: "tượng điêu khắc", example: "The sculpture is made of bronze." },
      { en: "melody", vi: "giai điệu", example: "The melody is easy to remember." },
      { en: "composer", vi: "nhà soạn nhạc", example: "Mozart was a famous composer." },
      { en: "performance", vi: "buổi biểu diễn", example: "The performance lasted two hours." },
      { en: "audience", vi: "khán giả", example: "The audience applauded loudly." },
      { en: "artistic", vi: "mang tính nghệ thuật", example: "She has artistic talent." }
    ]
  },
  {
    grade: 7, chapterIndex: 5, chapter: "Unit 5: Food and drink", book: "Tập 1",
    words: [
      { en: "ingredient", vi: "nguyên liệu", example: "Fresh ingredients make better food." },
      { en: "recipe", vi: "công thức nấu ăn", example: "Follow the recipe carefully." },
      { en: "cuisine", vi: "ẩm thực", example: "Vietnamese cuisine is diverse." },
      { en: "spicy", vi: "cay", example: "Thai food is often spicy." },
      { en: "vegetarian", vi: "ăn chay", example: "She follows a vegetarian diet." },
      { en: "beverage", vi: "đồ uống", example: "Tea is a popular beverage." },
      { en: "dairy", vi: "sản phẩm từ sữa", example: "Milk and cheese are dairy products." },
      { en: "portion", vi: "khẩu phần", example: "The portion is too large for me." }
    ]
  },
  {
    grade: 7, chapterIndex: 6, chapter: "Unit 6: A visit to a school", book: "Tập 1",
    words: [
      { en: "campus", vi: "khuôn viên trường", example: "The campus is very green." },
      { en: "library", vi: "thư viện", example: "Students study quietly in the library." },
      { en: "auditorium", vi: "hội trường", example: "The ceremony is in the auditorium." },
      { en: "facility", vi: "cơ sở vật chất", example: "The school has modern facilities." },
      { en: "principal", vi: "hiệu trưởng", example: "The principal welcomed the guests." },
      { en: "curriculum", vi: "chương trình học", example: "The curriculum includes English and IT." },
      { en: "exchange", vi: "trao đổi", example: "We joined a student exchange programme." },
      { en: "impressive", vi: "ấn tượng", example: "Their science lab is impressive." }
    ]
  },
  {
    grade: 7, chapterIndex: 7, chapter: "Unit 7: Traffic", book: "Tập 2",
    words: [
      { en: "pedestrian", vi: "người đi bộ", example: "Pedestrians should use the pavement." },
      { en: "pavement", vi: "vỉa hè", example: "Walk on the pavement, not the road." },
      { en: "helmet", vi: "mũ bảo hiểm", example: "Wear a helmet when riding a motorbike." },
      { en: "speed limit", vi: "giới hạn tốc độ", example: "The speed limit here is 40 km/h." },
      { en: "congestion", vi: "tắc đường", example: "Traffic congestion is worse at rush hour." },
      { en: "overtake", vi: "vượt xe", example: "Don't overtake on a narrow bridge." },
      { en: "junction", vi: "ngã tư", example: "Turn right at the next junction." },
      { en: "obey", vi: "tuân thủ", example: "Drivers must obey traffic rules." }
    ]
  },
  {
    grade: 7, chapterIndex: 8, chapter: "Unit 8: Films", book: "Tập 2",
    words: [
      { en: "blockbuster", vi: "phim bom tấn", example: "The blockbuster broke box-office records." },
      { en: "director", vi: "đạo diễn", example: "The director won an award." },
      { en: "plot", vi: "cốt truyện", example: "The plot was exciting." },
      { en: "review", vi: "bài đánh giá", example: "I read a positive review online." },
      { en: "subtitle", vi: "phụ đề", example: "The film has Vietnamese subtitles." },
      { en: "thriller", vi: "phim giật gân", example: "Thrillers keep you nervous." },
      { en: "cast", vi: "dàn diễn viên", example: "The cast includes famous actors." },
      { en: "scene", vi: "cảnh quay", example: "The opening scene is memorable." }
    ]
  },
  {
    grade: 7, chapterIndex: 9, chapter: "Unit 9: Festivals around the world", book: "Tập 2",
    words: [
      { en: "carnival", vi: "lễ hội carnival", example: "Rio Carnival is world-famous." },
      { en: "fireworks", vi: "pháo hoa", example: "We watched fireworks at midnight." },
      { en: "procession", vi: "đoàn rước", example: "A colourful procession moved through the street." },
      { en: "costume", vi: "trang phục hóa trang", example: "Children wear costumes on Halloween." },
      { en: "lantern", vi: "đèn lồng", example: "Lanterns light up the Mid-Autumn Festival." },
      { en: "ritual", vi: "nghi lễ", example: "The ritual has ancient origins." },
      { en: "harvest", vi: "mùa gặt", example: "The harvest festival thanks farmers." },
      { en: "spectacular", vi: "ngoạn mục", example: "The parade was spectacular." }
    ]
  },
  {
    grade: 7, chapterIndex: 10, chapter: "Unit 10: Energy sources", book: "Tập 2",
    words: [
      { en: "solar energy", vi: "năng lượng mặt trời", example: "Solar energy is clean and renewable." },
      { en: "wind power", vi: "năng lượng gió", example: "Wind power generates electricity." },
      { en: "hydropower", vi: "thủy điện", example: "Hydropower uses flowing water." },
      { en: "fossil fuel", vi: "nhiên liệu hóa thạch", example: "Coal is a fossil fuel." },
      { en: "emission", vi: "khí thải", example: "Cars produce carbon emissions." },
      { en: "efficient", vi: "hiệu quả", example: "LED bulbs are more efficient." },
      { en: "generator", vi: "máy phát điện", example: "The generator supplies power." },
      { en: "consumption", vi: "tiêu thụ", example: "We should reduce energy consumption." }
    ]
  },
  {
    grade: 7, chapterIndex: 11, chapter: "Unit 11: Travelling in the future", book: "Tập 2",
    words: [
      { en: "destination", vi: "điểm đến", example: "Da Nang is a popular destination." },
      { en: "itinerary", vi: "lịch trình chuyến đi", example: "Check the itinerary before leaving." },
      { en: "luggage", vi: "hành lý", example: "Don't forget your luggage." },
      { en: "boarding pass", vi: "thẻ lên máy bay", example: "Show your boarding pass at the gate." },
      { en: "delay", vi: "trì hoãn", example: "Our flight had a two-hour delay." },
      { en: "accommodation", vi: "chỗ ở", example: "We booked accommodation online." },
      { en: "sightseeing", vi: "tham quan", example: "We went sightseeing in Hue." },
      { en: "souvenir", vi: "quà lưu niệm", example: "I bought a souvenir for my friend." }
    ]
  },
  {
    grade: 7, chapterIndex: 12, chapter: "Unit 12: English-speaking countries", book: "Tập 2",
    words: [
      { en: "currency", vi: "đồng tiền", example: "The currency of the UK is the pound." },
      { en: "population", vi: "dân số", example: "Australia has a large population." },
      { en: "continent", vi: "lục địa", example: "Canada is in North America." },
      { en: "capital", vi: "thủ đô", example: "Canberra is the capital of Australia." },
      { en: "multicultural", vi: "đa văn hóa", example: "Singapore is a multicultural city." },
      { en: "native speaker", vi: "người bản ngữ", example: "She talks to native speakers online." },
      { en: "heritage", vi: "di sản", example: "The site is part of world heritage." },
      { en: "official language", vi: "ngôn ngữ chính thức", example: "English is an official language in India." }
    ]
  },
  // Grade 8 — abbreviated header, full words
  {
    grade: 8, chapterIndex: 1, chapter: "Unit 1: Leisure time", book: "Tập 1",
    words: [
      { en: "leisure activity", vi: "hoạt động giải trí", example: "Reading is a leisure activity." },
      { en: "detest", vi: "ghét cay ghét đắng", example: "I detest waking up early." },
      { en: "fancy", vi: "thích, muốn", example: "Do you fancy going swimming?" },
      { en: "addicted to", vi: "nghiện, mê", example: "He is addicted to video games." },
      { en: "keen on", vi: "say mê", example: "She is keen on photography." },
      { en: "board game", vi: "trò chơi board game", example: "We play board games at weekends." },
      { en: "pastime", vi: "thú tiêu khiển", example: "Chess is an old pastime." },
      { en: "recharge", vi: "nạp lại năng lượng", example: "Hobbies help me recharge." }
    ]
  },
  {
    grade: 8, chapterIndex: 2, chapter: "Unit 2: Life in the countryside", book: "Tập 1",
    words: [
      { en: "countryside", vi: "nông thôn", example: "Life in the countryside is peaceful." },
      { en: "harvest", vi: "mùa gặt", example: "Farmers work hard during harvest." },
      { en: "paddy field", vi: "cánh đồng lúa", example: "Green paddy fields stretch for miles." },
      { en: "barn", vi: "chuồng/kho thóc", example: "They store rice in the barn." },
      { en: "livestock", vi: "vật nuôi", example: "The farm raises livestock." },
      { en: "fresh air", vi: "không khí trong lành", example: "We enjoy fresh air in the village." },
      { en: "peaceful", vi: "yên bình", example: "The countryside is peaceful at night." },
      { en: "hard-working", vi: "chăm chỉ", example: "Village people are hard-working." }
    ]
  },
  {
    grade: 8, chapterIndex: 3, chapter: "Unit 3: Teenagers", book: "Tập 1",
    words: [
      { en: "adolescence", vi: "tuổi vị thành niên", example: "Adolescence can be challenging." },
      { en: "peer pressure", vi: "áp lực bạn bè", example: "Teens often face peer pressure." },
      { en: "independent", vi: "độc lập", example: "She wants to be more independent." },
      { en: "confident", vi: "tự tin", example: "Sport makes him more confident." },
      { en: "rebellious", vi: "ngỗ nghịch", example: "Rebellious teens question rules." },
      { en: "identity", vi: "bản sắc", example: "Teens explore their identity." },
      { en: "social media", vi: "mạng xã hội", example: "Social media influences teenagers." },
      { en: "self-esteem", vi: "lòng tự trọng", example: "Praise can improve self-esteem." }
    ]
  },
  {
    grade: 8, chapterIndex: 4, chapter: "Unit 4: Ethnic groups of Viet Nam", book: "Tập 1",
    words: [
      { en: "ethnic group", vi: "dân tộc", example: "Viet Nam has 54 ethnic groups." },
      { en: "costume", vi: "trang phục truyền thống", example: "Each group has its own costume." },
      { en: "handicraft", vi: "sản phẩm thủ công", example: "They sell local handicrafts." },
      { en: "stilt house", vi: "nhà sàn", example: "Some groups live in stilt houses." },
      { en: "gong", vi: "cồng chiêng", example: "Gong music is UNESCO heritage." },
      { en: "festival", vi: "lễ hội", example: "The festival celebrates harvest." },
      { en: "heritage", vi: "di sản", example: "We preserve cultural heritage." },
      { en: "minority", vi: "dân tộc thiểu số", example: "Ethnic minorities live in highlands." }
    ]
  },
  {
    grade: 8, chapterIndex: 5, chapter: "Unit 5: Our customs and traditions", book: "Tập 1",
    words: [
      { en: "custom", vi: "phong tục", example: "It is a local custom to visit ancestors." },
      { en: "tradition", vi: "truyền thống", example: "We respect family traditions." },
      { en: "ancestor", vi: "tổ tiên", example: "They worship their ancestors." },
      { en: "worship", vi: "thờ cúng", example: "Families worship on the first day of Tet." },
      { en: "ritual", vi: "nghi lễ", example: "The wedding ritual is long." },
      { en: "etiquette", vi: "nghi thức, lễ nghi", example: "Table etiquette varies by culture." },
      { en: "generation", vi: "thế hệ", example: "Traditions pass to the next generation." },
      { en: "superstition", vi: "mê tín", example: "Some superstitions are still believed." }
    ]
  },
  {
    grade: 8, chapterIndex: 6, chapter: "Unit 6: Lifestyles", book: "Tập 1",
    words: [
      { en: "urban", vi: "thuộc thành phố", example: "Urban lifestyles are fast-paced." },
      { en: "rural", vi: "thuộc nông thôn", example: "Rural areas are quieter." },
      { en: "commute", vi: "đi làm hàng ngày", example: "He commutes by bus." },
      { en: "stressful", vi: " căng thẳng", example: "City jobs can be stressful." },
      { en: "convenient", vi: "tiện lợi", example: "Online shopping is convenient." },
      { en: "affordable", vi: "phải chăng", example: "Street food is affordable." },
      { en: "work-life balance", vi: "cân bằng công việc – cuộc sống", example: "Yoga helps work-life balance." },
      { en: "sedentary", vi: "ít vận động", example: "A sedentary lifestyle is unhealthy." }
    ]
  },
  {
    grade: 8, chapterIndex: 7, chapter: "Unit 7: Environmental protection", book: "Tập 2",
    words: [
      { en: "deforestation", vi: "phá rừng", example: "Deforestation causes floods." },
      { en: "erosion", vi: "xói mòn", example: "Soil erosion damages farmland." },
      { en: "renewable", vi: "tái tạo được", example: "We need renewable energy." },
      { en: "conservation", vi: "bảo tồn", example: "Wildlife conservation is urgent." },
      { en: "ecosystem", vi: "hệ sinh thái", example: "Pollution harms the ecosystem." },
      { en: "campaign", vi: "chiến dịch", example: "Students joined a green campaign." },
      { en: "sustainable", vi: "bền vững", example: "Choose sustainable products." },
      { en: "carbon footprint", vi: "dấu chân carbon", example: "Cycling reduces your carbon footprint." }
    ]
  },
  {
    grade: 8, chapterIndex: 8, chapter: "Unit 8: Shopping", book: "Tập 2",
    words: [
      { en: "bargain", vi: "món hời", example: "This jacket was a real bargain." },
      { en: "receipt", vi: "hóa đơn", example: "Keep the receipt for returns." },
      { en: "discount", vi: "giảm giá", example: "The shop offers a 20% discount." },
      { en: "refund", vi: "hoàn tiền", example: "You can get a refund within seven days." },
      { en: "brand", vi: "thương hiệu", example: "She prefers famous brands." },
      { en: "consumer", vi: "người tiêu dùng", example: "Consumers compare prices online." },
      { en: "window shopping", vi: "ngắm đồ không mua", example: "We went window shopping at the mall." },
      { en: "checkout", vi: "quầy thanh toán", example: "Pay at the checkout counter." }
    ]
  },
  {
    grade: 8, chapterIndex: 9, chapter: "Unit 9: Natural disasters", book: "Tập 2",
    words: [
      { en: "earthquake", vi: "động đất", example: "The earthquake damaged buildings." },
      { en: "typhoon", vi: "bão", example: "The typhoon hit the coast." },
      { en: "flood", vi: "lũ lụt", example: "Heavy rain caused a flood." },
      { en: "landslide", vi: "lở đất", example: "The landslide blocked the road." },
      { en: "evacuate", vi: "sơ tán", example: "Residents had to evacuate." },
      { en: "relief", vi: "cứu trợ", example: "Relief supplies arrived quickly." },
      { en: "survivor", vi: "người sống sót", example: "Survivors need food and shelter." },
      { en: "warning", vi: "cảnh báo", example: "A storm warning was issued." }
    ]
  },
  {
    grade: 8, chapterIndex: 10, chapter: "Unit 10: Communication in the future", book: "Tập 2",
    words: [
      { en: "instant messaging", vi: "nhắn tin tức thì", example: "Instant messaging is popular." },
      { en: "video call", vi: "gọi video", example: "We had a video call with grandma." },
      { en: "virtual", vi: "ảo", example: "Virtual meetings save travel time." },
      { en: "connectivity", vi: "kết nối mạng", example: "Good connectivity is essential." },
      { en: "emoji", vi: "biểu tượng cảm xúc", example: "She added an emoji to the message." },
      { en: "cyberbullying", vi: "bắt nạt trên mạng", example: "Schools fight cyberbullying." },
      { en: "privacy", vi: "quyền riêng tư", example: "Protect your privacy online." },
      { en: "bandwidth", vi: "băng thông", example: "Streaming needs high bandwidth." }
    ]
  },
  {
    grade: 8, chapterIndex: 11, chapter: "Unit 11: Science and technology", book: "Tập 2",
    words: [
      { en: "breakthrough", vi: "đột phá", example: "The vaccine was a medical breakthrough." },
      { en: "innovation", vi: "đổi mới", example: "Innovation drives economic growth." },
      { en: "laboratory", vi: "phòng thí nghiệm", example: "Scientists work in the laboratory." },
      { en: "experiment", vi: "thí nghiệm", example: "The experiment succeeded." },
      { en: "discovery", vi: "phát hiện", example: "The discovery changed medicine." },
      { en: "satellite", vi: "vệ tinh", example: "Satellites orbit the Earth." },
      { en: "microscope", vi: "kính hiển vi", example: "Cells are visible under a microscope." },
      { en: "researcher", vi: "nhà nghiên cứu", example: "Researchers published new findings." }
    ]
  },
  {
    grade: 8, chapterIndex: 12, chapter: "Unit 12: Life on other planets", book: "Tập 2",
    words: [
      { en: "astronaut", vi: "phi hành gia", example: "Astronauts train for years." },
      { en: "spacecraft", vi: "tàu vũ trụ", example: "The spacecraft landed safely." },
      { en: "orbit", vi: "quỹ đạo", example: "The moon orbits the Earth." },
      { en: "galaxy", vi: "thiên hà", example: "Our galaxy contains billions of stars." },
      { en: "atmosphere", vi: "khí quyển", example: "Mars has a thin atmosphere." },
      { en: "gravity", vi: "trọng lực", example: "Gravity is weaker on the moon." },
      { en: "colonise", vi: "định cư (hành tinh)", example: "Could humans colonise Mars?" },
      { en: "extraterrestrial", vi: "ngoài Trái Đất", example: "Scientists search for extraterrestrial life." }
    ]
  },
  // Grade 9
  {
    grade: 9, chapterIndex: 1, chapter: "Unit 1: Local community", book: "Tập 1",
    words: [
      { en: "community helper", vi: "người giúp ích cộng đồng", example: "Teachers are community helpers." },
      { en: "handicraft", vi: "sản phẩm thủ công", example: "The village is famous for handicrafts." },
      { en: "workshop", vi: "xưởng, lớp thực hành", example: "They set up a weaving workshop." },
      { en: "volunteer", vi: "tình nguyện viên", example: "Volunteers clean the neighbourhood." },
      { en: "neighbourhood", vi: "khu phố", example: "Our neighbourhood is friendly." },
      { en: "pass down", vi: "truyền lại", example: "Skills are passed down through generations." },
      { en: "set up", vi: "thành lập", example: "They set up a youth club." },
      { en: "local", vi: "địa phương", example: "Buy local products to support farmers." }
    ]
  },
  {
    grade: 9, chapterIndex: 2, chapter: "Unit 2: City life", book: "Tập 1",
    words: [
      { en: "skyscraper", vi: "nhà chọc trời", example: "Skyscrapers define the skyline." },
      { en: "metropolitan", vi: "thuộc đô thị lớn", example: "HCMC is a metropolitan area." },
      { en: "infrastructure", vi: "cơ sở hạ tầng", example: "Good infrastructure attracts investment." },
      { en: "commuter", vi: "người đi làm xa", example: "Commuters rush to the subway." },
      { en: "entertainment", vi: "giải trí", example: "The city offers rich entertainment." },
      { en: "nightlife", vi: "cuộc sống về đêm", example: "The nightlife here is lively." },
      { en: "overcrowded", vi: "quá đông", example: "Buses are overcrowded at peak hours." },
      { en: "urbanisation", vi: "đô thị hóa", example: "Urbanisation changes rural areas." }
    ]
  },
  {
    grade: 9, chapterIndex: 3, chapter: "Unit 3: Healthy living for teens", book: "Tập 1",
    words: [
      { en: "nutrition", vi: "dinh dưỡng", example: "Good nutrition supports growth." },
      { en: "sleep deprivation", vi: "thiếu ngủ", example: "Sleep deprivation affects concentration." },
      { en: "mental health", vi: "sức khỏe tinh thần", example: "Talk about mental health openly." },
      { en: "stress", vi: "căng thẳng", example: "Exams cause stress for teens." },
      { en: "workout", vi: "buổi tập thể dục", example: "A short workout boosts energy." },
      { en: "hydrated", vi: "đủ nước", example: "Stay hydrated during sport." },
      { en: "screen time", vi: "thời gian dùng màn hình", example: "Limit screen time before bed." },
      { en: "wellness", vi: "sức khỏe toàn diện", example: "Schools promote student wellness." }
    ]
  },
  {
    grade: 9, chapterIndex: 4, chapter: "Unit 4: Remembering the past", book: "Tập 1",
    words: [
      { en: "memoir", vi: "hồi ký", example: "Grandpa wrote his memoir." },
      { en: "childhood", vi: "tuổi thơ", example: "She remembers her childhood fondly." },
      { en: "reminisce", vi: "hồi tưởng", example: "Old friends reminisce about school." },
      { en: "generation", vi: "thế hệ", example: "Stories pass between generations." },
      { en: "tradition", vi: "truyền thống", example: "We keep family traditions alive." },
      { en: "historical", vi: "thuộc lịch sử", example: "The town has historical sites." },
      { en: "preserve", vi: "bảo tồn", example: "Museums preserve the past." },
      { en: "nostalgic", vi: "hoài niệm", example: "The photo made her nostalgic." }
    ]
  },
  {
    grade: 9, chapterIndex: 5, chapter: "Unit 5: Our experiences", book: "Tập 1",
    words: [
      { en: "experience", vi: "trải nghiệm", example: "Travel broadens your experience." },
      { en: "scuba diving", vi: "lặn biển có bình khí", example: "Have you tried scuba diving?" },
      { en: "backpacking", vi: "du lịch ba lô", example: "Backpacking is cheap and fun." },
      { en: "memorable", vi: "đáng nhớ", example: "It was a memorable trip." },
      { en: "adventurous", vi: " thích phiêu lưu", example: "She is adventurous and brave." },
      { en: "culture shock", vi: "sốc văn hóa", example: "He felt culture shock abroad." },
      { en: "host family", vi: "gia đình chủ nhà (homestay)", example: "I stayed with a host family." },
      { en: "exchange programme", vi: "chương trình trao đổi", example: "She joined an exchange programme." }
    ]
  },
  {
    grade: 9, chapterIndex: 6, chapter: "Unit 6: Vietnamese lifestyles: Then and now", book: "Tập 1",
    words: [
      { en: "then and now", vi: "ngày xưa và nay", example: "Compare lifestyles then and now." },
      { en: "folk music", vi: "nhạc dân gian", example: "Grandpa enjoys folk music." },
      { en: "texting", vi: "nhắn tin", example: "People prefer texting to calling." },
      { en: "neighbourhood", vi: "khu phố", example: "Neighbourhoods have changed a lot." },
      { en: "modernise", vi: "hiện đại hóa", example: "Cities modernise quickly." },
      { en: "tradition", vi: "truyền thống", example: "Some traditions remain strong." },
      { en: "appliance", vi: "thiết bị gia dụng", example: "Homes now have more appliances." },
      { en: "commute", vi: "đi làm hàng ngày", example: "More people commute by motorbike." }
    ]
  },
  {
    grade: 9, chapterIndex: 7, chapter: "Unit 7: Natural wonders of the world", book: "Tập 2",
    words: [
      { en: "natural wonder", vi: "kỳ quan thiên nhiên", example: "Ha Long Bay is a natural wonder." },
      { en: "heritage site", vi: "di sản", example: "The heritage site attracts tourists." },
      { en: "geological", vi: "thuộc địa chất", example: "The cave has geological features." },
      { en: "formation", vi: "cấu trúc địa hình", example: "The rock formation is sacred." },
      { en: "haunted", vi: "bị ám", example: "It is said that the place is haunted." },
      { en: "tour guide", vi: "hướng dẫn viên du lịch", example: "Our tour guide was knowledgeable." },
      { en: "landmark", vi: "địa danh", example: "The landmark is on every postcard." },
      { en: "spectacular", vi: "ngoạn mục", example: "The waterfall is spectacular." }
    ]
  },
  {
    grade: 9, chapterIndex: 8, chapter: "Unit 8: Tourism", book: "Tập 2",
    words: [
      { en: "tourism", vi: "ngành du lịch", example: "Tourism creates many jobs." },
      { en: "itinerary", vi: "lịch trình", example: "Our itinerary includes three cities." },
      { en: "heritage", vi: "di sản", example: "The heritage site is protected." },
      { en: "hospitality", vi: "ngành khách sạn/dịch vụ", example: "She works in hospitality." },
      { en: "eco-tourism", vi: "du lịch sinh thái", example: "Eco-tourism protects nature." },
      { en: "souvenir", vi: "quà lưu niệm", example: "Tourists buy local souvenirs." },
      { en: "reservation", vi: "đặt chỗ", example: "Make a reservation early." },
      { en: "sightseeing", vi: "tham quan", example: "We went sightseeing all day." }
    ]
  },
  {
    grade: 9, chapterIndex: 9, chapter: "Unit 9: World Englishes", book: "Tập 2",
    words: [
      { en: "dialect", vi: "phương ngữ", example: "British and American dialects differ." },
      { en: "accent", vi: "giọng", example: "She speaks with an Australian accent." },
      { en: "fluent", vi: "trôi chảy", example: "Practice until you are fluent." },
      { en: "bilingual", vi: "song ngữ", example: "Many students are bilingual." },
      { en: "communicate", vi: "giao tiếp", example: "English helps you communicate globally." },
      { en: "pronunciation", vi: "phát âm", example: "Good pronunciation aids understanding." },
      { en: "vocabulary", vi: "từ vựng", example: "Reading expands your vocabulary." },
      { en: "global language", vi: "ngôn ngữ toàn cầu", example: "English is a global language." }
    ]
  },
  {
    grade: 9, chapterIndex: 10, chapter: "Unit 10: Planet Earth", book: "Tập 2",
    words: [
      { en: "climate change", vi: "biến đổi khí hậu", example: "Climate change affects weather." },
      { en: "greenhouse gas", vi: "khí nhà kính", example: "Cars emit greenhouse gases." },
      { en: "recycle", vi: "tái chế", example: "Recycle plastic bottles." },
      { en: "drought", vi: "hạn hán", example: "Drought destroys crops." },
      { en: "biodiversity", vi: "đa dạng sinh học", example: "Forests support biodiversity." },
      { en: "environmental club", vi: "câu lạc bộ môi trường", example: "She leads the environmental club." },
      { en: "sustainable", vi: "bền vững", example: "Choose sustainable habits." },
      { en: "renewable", vi: "tái tạo được", example: "Renewable energy reduces pollution." }
    ]
  },
  {
    grade: 9, chapterIndex: 11, chapter: "Unit 11: Electronic devices", book: "Tập 2",
    words: [
      { en: "smartphone", vi: "điện thoại thông minh", example: "Almost every teen has a smartphone." },
      { en: "application", vi: "ứng dụng", example: "Download the learning application." },
      { en: "download", vi: "tải xuống", example: "The app is downloaded by millions." },
      { en: "charge", vi: "sạc (pin)", example: "He forgot to charge his phone." },
      { en: "gadget", vi: "thiết bị công nghệ", example: "New gadgets appear every year." },
      { en: "inventor", vi: "nhà phát minh", example: "Bell was a famous inventor." },
      { en: "wireless", vi: "không dây", example: "Wireless headphones are convenient." },
      { en: "upgrade", vi: "nâng cấp", example: "I want to upgrade my laptop." }
    ]
  },
  {
    grade: 9, chapterIndex: 12, chapter: "Unit 12: Career choices", book: "Tập 2",
    words: [
      { en: "career", vi: "nghề nghiệp", example: "Choose a career you enjoy." },
      { en: "surgeon", vi: "bác sĩ phẫu thuật", example: "A surgeon performs operations." },
      { en: "qualification", vi: "bằng cấp", example: "The job requires qualifications." },
      { en: "apprenticeship", vi: "học nghề", example: "He started an apprenticeship." },
      { en: "entrepreneur", vi: "doanh nhân", example: "An entrepreneur starts businesses." },
      { en: "skill set", vi: "bộ kỹ năng", example: "IT jobs need a strong skill set." },
      { en: "interview", vi: "phỏng vấn", example: "She prepared for the job interview." },
      { en: "profession", vi: "nghề nghiệp (chuyên môn)", example: "Teaching is a noble profession." }
    ]
  }
];

function skillId(pack) {
  return `g${pack.grade}_u${pack.chapterIndex}_vocab`;
}

function pickDistractors(words, correct, count = 3) {
  return words
    .filter((w) => w.en !== correct.en)
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map((w) => w);
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildSkill(pack) {
  const id = skillId(pack);
  return {
    id,
    title: `Unit ${pack.chapterIndex} · Từ vựng`,
    grade: pack.grade,
    book: pack.book,
    chapter: pack.chapter,
    chapterIndex: pack.chapterIndex,
    lessonNo: 10,
    domain: "Vocabulary",
    skillType: "vocabulary",
    grammar: "vocabulary",
    level: 1,
    prerequisite: [],
    description: `Học ${pack.words.length} từ vựng trọng tâm của ${pack.chapter.split(": ")[1] || pack.chapter}.`,
    formula: `${pack.words.length} từ · EN ↔ VI`,
    visualization: "vocabulary"
  };
}

function buildLesson(pack) {
  const id = skillId(pack);
  const topic = pack.chapter.split(": ")[1] || pack.chapter;
  const sample = pack.words[0];
  return {
    id,
    title: `Unit ${pack.chapterIndex} · Từ vựng`,
    skill: id,
    chapter: pack.chapter,
    source: SOURCE,
    xp: 50,
    steps: [
      {
        type: "intro",
        title: "Mục tiêu bài học",
        content: `Nắm ${pack.words.length} từ vựng chủ đề "${topic}" theo SGK Global Success.`
      },
      {
        type: "vocabulary",
        title: "Danh sách từ vựng",
        content: "Đọc từ tiếng Anh, nghĩa tiếng Việt và câu ví dụ. Nhấn vào từng thẻ để ghi nhớ.",
        words: pack.words
      },
      {
        type: "example",
        title: "Dùng từ trong câu",
        content: "Học cách dùng từ qua ví dụ thực tế.",
        example: {
          correct: sample.example || `${sample.en} — ${sample.vi}`,
          wrong: `Sai: dùng nhầm nghĩa hoặc viết sai chính tả "${sample.en}".`
        }
      },
      {
        type: "summary",
        title: "Ghi nhớ nhanh",
        content: pack.words.map((w) => w.en).join(" · ")
      }
    ]
  };
}

function buildQuestions(pack) {
  const id = skillId(pack);
  const words = pack.words;
  const w0 = words[0];
  const w1 = words[1];
  const w2 = words[2];
  const w3 = words[3];

  const d1 = pickDistractors(words, w0).map((w) => w.vi);
  const d2 = pickDistractors(words, w1).map((w) => w.en);

  return [
    {
      id: `q_${id}_1`,
      skill: id,
      grammar: "vocabulary",
      type: "multiple_choice",
      question: `Từ "${w0.en}" nghĩa là gì?`,
      choices: shuffle([w0.vi, ...d1.slice(0, 3)]),
      answer: w0.vi,
      hint: w0.example || `Nghĩa: ${w0.vi}.`
    },
    {
      id: `q_${id}_2`,
      skill: id,
      grammar: "vocabulary",
      type: "multiple_choice",
      question: `"${w1.vi}" tiếng Anh là gì?`,
      choices: shuffle([w1.en, ...d2.slice(0, 3)]),
      answer: w1.en,
      hint: `Đáp án: ${w1.en}.`
    },
    {
      id: `q_${id}_3`,
      skill: id,
      grammar: "vocabulary",
      type: "input",
      question: `Viết từ tiếng Anh: ${w2.vi}`,
      answer: w2.en,
      alternatives: w2.en.includes(" ") ? [w2.en.replace(/-/g, " ")] : [],
      hint: w2.example || `Từ bắt đầu bằng "${w2.en.charAt(0).toUpperCase()}…"`
    },
    {
      id: `q_${id}_4`,
      skill: id,
      grammar: "vocabulary",
      type: "multiple_choice",
      question: `Chọn từ phù hợp: ${(w3.example || `${w3.en} is important.`).replace(w3.en, "___")}`,
      choices: shuffle([w3.en, ...pickDistractors(words, w3).slice(0, 3).map((w) => w.en)]),
      answer: w3.en,
      hint: `Ngữ cảnh cần "${w3.en}" (${w3.vi}).`
    }
  ];
}

function merge() {
  const skillsPath = path.join(dataDir, "skills.json");
  const lessonsPath = path.join(dataDir, "lessons.json");
  const questionsPath = path.join(dataDir, "questions.json");

  const skills = JSON.parse(fs.readFileSync(skillsPath, "utf8"));
  const lessons = JSON.parse(fs.readFileSync(lessonsPath, "utf8"));
  const questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));

  const vocabIds = new Set(PACKS.map(skillId));
  const baseSkills = skills.filter((s) => !vocabIds.has(s.id));
  const baseLessons = lessons.filter((l) => !vocabIds.has(l.id));
  const baseQuestions = questions.filter((q) => !vocabIds.has(q.skill));

  const vocabSkills = PACKS.map(buildSkill);
  const vocabLessons = PACKS.map(buildLesson);
  const vocabQuestions = PACKS.flatMap(buildQuestions);

  fs.writeFileSync(skillsPath, JSON.stringify([...baseSkills, ...vocabSkills], null, 2) + "\n");
  fs.writeFileSync(lessonsPath, JSON.stringify([...baseLessons, ...vocabLessons], null, 2) + "\n");
  fs.writeFileSync(questionsPath, JSON.stringify([...baseQuestions, ...vocabQuestions], null, 2) + "\n");

  console.log("Vocabulary packs:", PACKS.length);
  console.log("Vocab skills:", vocabSkills.length);
  console.log("Vocab questions:", vocabQuestions.length);
  console.log("Total skills:", baseSkills.length + vocabSkills.length);
  console.log("Total questions:", baseQuestions.length + vocabQuestions.length);
}

merge();
