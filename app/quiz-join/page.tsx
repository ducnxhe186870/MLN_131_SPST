'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Award, Timer, RefreshCw, ChevronRight, X, Play, User, CheckCircle, XCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';

interface QuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_SESSION_COUNT = 12;

const quizData: QuizItem[] = [
  { question: "Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam mang bản chất nào sau đây?", options: ["Nhà nước của một giai cấp cầm quyền tách rời Nhân dân", "Nhà nước của Nhân dân, do Nhân dân, vì Nhân dân", "Nhà nước chỉ phục vụ bộ máy hành chính", "Nhà nước đứng ngoài đời sống xã hội"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Trong Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam, chủ thể của quyền lực nhà nước là", options: ["Chính phủ", "Quốc hội", "Nhân dân", "Tòa án"], correctIndex: 2, explanation: "Đáp án đúng: C" },
  { question: "Đặc điểm nổi bật của Nhà nước pháp quyền là", options: ["Quản lý xã hội chủ yếu bằng ý chí cá nhân", "Quản lý xã hội bằng Hiến pháp và pháp luật", "Quản lý xã hội bằng tập quán là chính", "Quản lý xã hội không cần kiểm soát quyền lực"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Yếu tố nào phản ánh đúng bản chất dân chủ của Nhà nước pháp quyền XHCN Việt Nam?", options: ["Mọi quyền lực tập trung vào một cá nhân", "Nhân dân tham gia quản lý nhà nước và xã hội", "Chỉ cán bộ mới có quyền quyết định mọi vấn đề", "Nhân dân chỉ có nghĩa vụ, không có quyền"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Mục tiêu hoạt động của Nhà nước pháp quyền XHCN Việt Nam là", options: ["Phục vụ lợi ích của một nhóm nhỏ", "Bảo đảm lợi ích của cơ quan công quyền", "Phục vụ Nhân dân, bảo vệ Tổ quốc và phát triển đất nước", "Chỉ duy trì trật tự hành chính"], correctIndex: 2, explanation: "Đáp án đúng: C" },
  { question: "Trong Nhà nước pháp quyền XHCN Việt Nam, pháp luật giữ vai trò", options: ["Chỉ để xử phạt", "Công cụ quản lý xã hội cơ bản và bảo vệ quyền, lợi ích hợp pháp", "Chỉ áp dụng cho cán bộ", "Không có vai trò lớn"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Nội dung nào sau đây thể hiện rõ tính pháp quyền của Nhà nước?", options: ["Nhà nước hoạt động theo cảm tính", "Nhà nước và công dân đều phải tuân thủ pháp luật", "Chỉ người dân phải tuân thủ pháp luật", "Cơ quan nhà nước có thể đứng trên pháp luật"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Một trong những giá trị cốt lõi của Nhà nước pháp quyền XHCN Việt Nam là", options: ["Hạn chế quyền công dân", "Tôn trọng và bảo vệ quyền con người, quyền công dân", "Tăng đặc quyền cho bộ máy nhà nước", "Giảm vai trò giám sát của xã hội"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Nhà nước pháp quyền XHCN Việt Nam được xây dựng dưới sự lãnh đạo của", options: ["Chính phủ", "Quốc hội", "Đảng Cộng sản Việt Nam", "Mặt trận Tổ quốc Việt Nam"], correctIndex: 2, explanation: "Đáp án đúng: C" },
  { question: "Một biểu hiện của Nhà nước pháp quyền là", options: ["Mọi hoạt động của bộ máy nhà nước đều phải có cơ sở pháp lý", "Cơ quan nhà nước được làm mọi điều mình muốn", "Không cần công khai, minh bạch", "Pháp luật chỉ mang tính hình thức"], correctIndex: 0, explanation: "Đáp án đúng: A" },
  { question: "Quyền lực nhà nước ở Việt Nam được tổ chức theo nguyên tắc nào?", options: ["Phân lập tuyệt đối", "Thống nhất, có sự phân công, phối hợp và kiểm soát", "Tập trung hoàn toàn vào tư pháp", "Tập trung hoàn toàn vào hành pháp"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Cách hiểu nào đúng về quyền lực nhà nước trong Nhà nước pháp quyền XHCN Việt Nam?", options: ["Chỉ cần thống nhất, không cần kiểm soát", "Chỉ cần phân công, không cần phối hợp", "Vừa thống nhất, vừa phải có cơ chế kiểm soát quyền lực", "Không cần kiểm soát vì đã có pháp luật"], correctIndex: 2, explanation: "Đáp án đúng: C" },
  { question: "Quốc hội trong bộ máy nhà nước Việt Nam có vai trò chủ yếu là", options: ["Cơ quan xét xử cao nhất", "Cơ quan quyền lực nhà nước cao nhất", "Cơ quan điều tra trung ương", "Cơ quan hành chính cao nhất"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Chính phủ là cơ quan chủ yếu thực hiện", options: ["Quyền lập hiến", "Quyền lập pháp", "Quyền hành pháp", "Quyền giám sát tối cao"], correctIndex: 2, explanation: "Đáp án đúng: C" },
  { question: "Tòa án nhân dân là cơ quan thực hiện", options: ["Quyền lập pháp", "Quyền tư pháp", "Quyền hành pháp", "Quyền giám sát xã hội"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Viện kiểm sát nhân dân có chức năng chủ yếu là", options: ["Ban hành luật", "Thực hành quyền công tố và kiểm sát hoạt động tư pháp", "Tổ chức bầu cử", "Quản lý hành chính địa phương"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Nội dung nào phản ánh đúng yêu cầu đối với hoạt động của bộ máy nhà nước?", options: ["Chỉ cần đúng quy trình nội bộ", "Phải công khai, minh bạch, hiệu lực, hiệu quả", "Chỉ cần nhanh, không cần đúng pháp luật", "Không cần giải trình trước Nhân dân"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Trách nhiệm giải trình của cơ quan nhà nước có ý nghĩa chủ yếu là", options: ["Tạo thêm thủ tục hình thức", "Buộc cơ quan nhà nước giải thích, chịu trách nhiệm về quyết định và hành vi của mình", "Làm giảm hiệu quả quản lý", "Chỉ áp dụng cho cơ quan tư pháp"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Dân chủ trong Nhà nước pháp quyền XHCN Việt Nam được thực hiện bằng", options: ["Chỉ dân chủ trực tiếp", "Chỉ dân chủ đại diện", "Kết hợp dân chủ trực tiếp và dân chủ đại diện", "Không cần dân chủ vì đã có pháp luật"], correctIndex: 2, explanation: "Đáp án đúng: C" },
  { question: "Quyền khiếu nại, tố cáo của công dân thể hiện", options: ["Công dân có thể đứng trên pháp luật", "Cơ chế để Nhân dân giám sát hoạt động nhà nước", "Sự thay thế hoạt động của cơ quan tư pháp", "Công dân có quyền tự xử lý vi phạm"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Yêu cầu thượng tôn Hiến pháp và pháp luật được hiểu là", options: ["Chỉ cơ quan nhà nước phải tuân thủ", "Chỉ cán bộ, công chức phải tuân thủ", "Mọi chủ thể trong xã hội đều phải tôn trọng và chấp hành", "Chỉ áp dụng trong lĩnh vực tư pháp"], correctIndex: 2, explanation: "Đáp án đúng: C" },
  { question: "Một nhà nước được xem là pháp quyền khi", options: ["Pháp luật đứng dưới cơ quan công quyền", "Hiến pháp và pháp luật có vị trí tối cao trong tổ chức và hoạt động nhà nước", "Cơ quan nhà nước tự quyết ngoài khuôn khổ pháp luật", "Mọi quyết định chỉ dựa vào chỉ đạo hành chính"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Trong Nhà nước pháp quyền XHCN Việt Nam, cán bộ, công chức phải", options: ["Chỉ phục tùng cấp trên", "Tôn trọng Nhân dân, phục vụ Nhân dân", "Ưu tiên quyền lợi cá nhân", "Không cần chịu giám sát của xã hội"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Nội dung nào sau đây phản ánh đúng mối quan hệ giữa Nhà nước và Nhân dân?", options: ["Nhà nước là chủ thể ban phát quyền cho Nhân dân", "Nhà nước chịu sự giám sát của Nhân dân", "Nhà nước không cần tiếp thu ý kiến Nhân dân", "Nhân dân chỉ có nghĩa vụ chấp hành"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Mục đích của việc kiểm soát quyền lực nhà nước là", options: ["Làm suy yếu bộ máy nhà nước", "Phòng ngừa lạm quyền, tha hóa quyền lực", "Làm chậm hoạt động của cơ quan công quyền", "Thay thế vai trò lãnh đạo của Đảng"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Một trong những yêu cầu quan trọng hiện nay đối với Nhà nước pháp quyền XHCN Việt Nam là", options: ["Giảm vai trò của pháp luật", "Hoàn thiện hệ thống pháp luật đồng bộ, thống nhất, khả thi", "Tăng quản lý bằng mệnh lệnh hành chính", "Thu hẹp quyền giám sát của Nhân dân"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Giải pháp nào góp phần trực tiếp nâng cao hiệu lực, hiệu quả quản lý nhà nước?", options: ["Bộ máy cồng kềnh hơn", "Tổ chức bộ máy tinh gọn, hoạt động hiệu lực, hiệu quả", "Tăng tầng nấc trung gian", "Hạn chế phân công nhiệm vụ rõ ràng"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Một trong những yêu cầu của cải cách hành chính hiện nay là", options: ["Giảm ứng dụng công nghệ", "Xây dựng nền hành chính chuyên nghiệp, hiện đại, phục vụ Nhân dân", "Ưu tiên thủ tục phức tạp", "Tăng cơ chế xin - cho"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Vì sao phải tiếp tục hoàn thiện cơ chế kiểm soát quyền lực nhà nước?", options: ["Vì bộ máy nhà nước không cần tự đổi mới", "Vì nguy cơ lạm quyền, tham nhũng, tiêu cực vẫn còn", "Vì pháp luật không còn cần thiết", "Vì kiểm soát quyền lực chỉ mang tính hình thức"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Một trong những giải pháp quan trọng để hoàn thiện Nhà nước pháp quyền hiện nay là", options: ["Làm mờ ranh giới chức năng giữa các cơ quan", "Phân công rõ chức năng, nhiệm vụ, quyền hạn giữa các cơ quan", "Trao toàn bộ quyền lực cho một cơ quan", "Hạn chế cơ chế phối hợp"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Trong xây dựng Nhà nước pháp quyền, cải cách tư pháp nhằm mục tiêu chủ yếu nào?", options: ["Tăng sự phụ thuộc của tòa án vào hành pháp", "Xây dựng nền tư pháp chuyên nghiệp, công bằng, nghiêm minh", "Hạn chế quyền tiếp cận công lý", "Giảm vai trò bảo vệ công lý"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Yếu tố nào có ý nghĩa quyết định trong việc đưa pháp luật vào cuộc sống?", options: ["Chỉ ban hành thật nhiều luật", "Tổ chức thực hiện pháp luật nghiêm minh, hiệu quả", "Chỉ tuyên truyền khẩu hiệu", "Chỉ tăng chế tài xử phạt"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Việc xây dựng đội ngũ cán bộ, công chức trong Nhà nước pháp quyền hiện nay phải theo hướng", options: ["Đông về số lượng là đủ", "Có phẩm chất, năng lực, liêm chính, chuyên nghiệp", "Chỉ cần kinh nghiệm, không cần đạo đức", "Chỉ cần trung thành, không cần chuyên môn"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Một trong những biểu hiện của sự hoàn thiện Nhà nước pháp quyền là", options: ["Cơ quan công quyền né tránh trách nhiệm", "Công khai, minh bạch và trách nhiệm giải trình được tăng cường", "Thông tin nhà nước ngày càng khép kín", "Giảm giám sát xã hội"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Phòng, chống tham nhũng, tiêu cực có ý nghĩa như thế nào đối với xây dựng Nhà nước pháp quyền?", options: ["Không liên quan", "Là điều kiện quan trọng để xây dựng bộ máy trong sạch, vững mạnh", "Chỉ là nhiệm vụ riêng của thanh tra", "Chỉ cần thực hiện trong lĩnh vực kinh tế"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Vai trò của Nhân dân trong hoàn thiện Nhà nước pháp quyền hiện nay thể hiện rõ nhất ở chỗ", options: ["Chỉ chấp hành quyết định của cơ quan nhà nước", "Tham gia góp ý, giám sát, phản biện và thực hiện quyền làm chủ", "Không cần tham gia quản lý xã hội", "Chỉ tham gia bầu cử là đủ"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Mặt trận Tổ quốc và các tổ chức chính trị - xã hội có vai trò quan trọng trong", options: ["Thay thế cơ quan nhà nước", "Giám sát và phản biện xã hội", "Ban hành Hiến pháp", "Điều hành hoạt động tư pháp"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Để pháp luật thực sự đi vào đời sống, cần chú trọng điều gì?", options: ["Chỉ tăng số lượng văn bản", "Nâng cao ý thức pháp luật của cán bộ và Nhân dân", "Chỉ xử phạt nặng", "Giảm phổ biến, giáo dục pháp luật"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Một trong những xu hướng phù hợp để hoàn thiện Nhà nước pháp quyền hiện nay là", options: ["Hạn chế chuyển đổi số", "Đẩy mạnh xây dựng nền quản trị quốc gia hiện đại", "Tăng quản lý thủ công, phân tán", "Giảm cung cấp dịch vụ công"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Hoàn thiện Nhà nước pháp quyền XHCN Việt Nam hiện nay phải gắn với yêu cầu nào?", options: ["Chỉ phát triển kinh tế, không cần đổi mới chính trị", "Đổi mới đồng bộ giữa tổ chức bộ máy, pháp luật và cơ chế thực thi", "Chỉ sửa luật là đủ", "Chỉ chú trọng tuyên truyền"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Điểm khác biệt cơ bản giữa Nhà nước pháp quyền XHCN Việt Nam với mô hình nhà nước pháp quyền tư sản là", options: ["Không sử dụng pháp luật", "Gắn với mục tiêu bảo đảm quyền làm chủ của Nhân dân và định hướng xã hội chủ nghĩa", "Không có sự lãnh đạo chính trị", "Không quan tâm quyền con người"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Xây dựng Nhà nước pháp quyền XHCN Việt Nam vừa phải bảo đảm dân chủ, vừa phải", options: ["Xóa bỏ kỷ cương", "Tăng cường pháp chế và kỷ luật, kỷ cương xã hội", "Giảm hiệu lực quản lý nhà nước", "Hạn chế vai trò pháp luật"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Vì sao nói kiểm soát quyền lực là yêu cầu tất yếu của Nhà nước pháp quyền?", options: ["Vì quyền lực nhà nước luôn tuyệt đối đúng", "Vì quyền lực nếu không được kiểm soát dễ dẫn tới lạm quyền, tham nhũng, tiêu cực", "Vì quyền lực nhà nước không cần chịu trách nhiệm", "Vì pháp luật không có giá trị ràng buộc"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Cách hiểu đúng nhất về mối quan hệ giữa pháp luật và quyền con người trong Nhà nước pháp quyền XHCN Việt Nam là", options: ["Pháp luật chỉ để hạn chế quyền con người", "Pháp luật là công cụ ghi nhận, bảo vệ và bảo đảm thực hiện quyền con người, quyền công dân", "Quyền con người đứng ngoài pháp luật", "Quyền con người không liên quan đến nhà nước"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Khi nói xây dựng Nhà nước pháp quyền phải lấy người dân làm trung tâm, điều đó nhấn mạnh", options: ["Nhà nước chỉ cần lắng nghe người dân trong bầu cử", "Mọi chính sách, pháp luật và hoạt động công quyền phải hướng tới phục vụ người dân", "Người dân có thể thay pháp luật", "Cơ quan nhà nước không cần mục tiêu phát triển"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Hoàn thiện Nhà nước pháp quyền hiện nay không chỉ là sửa đổi pháp luật mà còn phải", options: ["Thu hẹp trách nhiệm công vụ", "Đổi mới tổ chức thực hiện pháp luật và nâng cao chất lượng đội ngũ thực thi", "Giảm vai trò giám sát xã hội", "Tăng quyền tùy tiện cho cơ quan nhà nước"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Xây dựng nền tư pháp chuyên nghiệp, hiện đại, công bằng, nghiêm minh có ý nghĩa trực tiếp nhất là", options: ["Làm tăng thủ tục pháp lý", "Bảo vệ công lý, quyền con người, quyền công dân", "Tăng vai trò chỉ đạo của hành pháp đối với xét xử", "Giảm tính độc lập của thẩm phán"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Giải pháp nào sau đây thể hiện rõ yêu cầu xây dựng Nhà nước pháp quyền trong giai đoạn mới?", options: ["Tăng cơ chế đặc quyền cho cán bộ", "Đẩy mạnh công khai, minh bạch, trách nhiệm giải trình và chuyển đổi số trong quản trị nhà nước", "Giảm quyền tiếp cận thông tin của người dân", "Hạn chế giám sát của báo chí và xã hội"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Muốn Nhà nước pháp quyền XHCN Việt Nam vận hành hiệu quả, yếu tố nào cần được kết hợp chặt chẽ?", options: ["Chỉ xây dựng pháp luật", "Xây dựng pháp luật, tổ chức thực hiện pháp luật và kiểm soát quyền lực", "Chỉ tinh giản bộ máy", "Chỉ xử lý vi phạm"], correctIndex: 1, explanation: "Đáp án đúng: B" },
  { question: "Nhận định nào sau đây khái quát đúng nhất về phương hướng hoàn thiện Nhà nước pháp quyền XHCN Việt Nam hiện nay?", options: ["Tập trung quyền lực tuyệt đối để quản lý nhanh hơn", "Xây dựng nhà nước trong sạch, vững mạnh, tinh gọn, hiệu lực, hiệu quả; thượng tôn Hiến pháp và pháp luật; bảo đảm quyền con người, quyền công dân; tăng cường kiểm soát quyền lực", "Chỉ ưu tiên phát triển kinh tế, tạm gác hoàn thiện nhà nước", "Giảm vai trò tham gia của Nhân dân để tránh phức tạp"], correctIndex: 1, explanation: "Đáp án đúng: B" },
];

function pickRandomQuizItems(items: QuizItem[], count: number): QuizItem[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, items.length));
}

export default function QuizJoinPage() {
  const [playerName, setPlayerName] = useState('');
  const [joined, setJoined] = useState(false);
  const [sessionQuiz, setSessionQuiz] = useState<QuizItem[]>([]);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [expandedReviewIdx, setExpandedReviewIdx] = useState<number | null>(null);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      const selected = pickRandomQuizItems(quizData, QUIZ_SESSION_COUNT);
      setSessionQuiz(selected);
      setUserAnswers(new Array(selected.length).fill(null));
      setJoined(true);
    }
  };

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks
    setSelectedAnswer(idx);
    
    // Update user answer history
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[currentIdx] = idx;
      return updated;
    });

    if (idx === sessionQuiz[currentIdx].correctIndex) {
      setScore(s => s + 1);
    }
    
    setTimeout(() => {
      if (currentIdx + 1 < sessionQuiz.length) {
        setCurrentIdx(c => c + 1);
        setSelectedAnswer(null);
      } else {
        setIsFinished(true);
      }
    }, 1800);
  };
  
  const handleRestart = () => {
    setJoined(false);
    setIsFinished(false);
    setCurrentIdx(0);
    setScore(0);
    setSelectedAnswer(null);
    setPlayerName('');
    setSessionQuiz([]);
    setUserAnswers([]);
    setExpandedReviewIdx(null);
  };

  // 1. Màn hình Nhập Tên (Hộ Chiếu Sĩ Tử)
  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#FAF8F5] via-[#FDF9F2] to-[#FAF8F5] dark:from-[#0B0D17] dark:via-[#12162A] dark:to-[#0B0D17] relative overflow-hidden pt-28">
        <Link 
          href="/quiz"
          className="fixed z-50 px-3.5 py-2 text-[10px] font-sans font-black uppercase tracking-widest text-white bg-gradient-to-r from-red-650 to-red-600 hover:from-red-600 hover:to-red-500 border border-red-750 dark:border-red-500 rounded-xl top-20 right-4 shadow-md shadow-red-650/15 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-md"
        >
          Thoát chế độ
        </Link>
        {/* Glow Spheres */}
        <div className="absolute top-[20%] left-[10%] w-[35vw] h-[35vw] bg-red-650/5 dark:bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] bg-amber-500/5 dark:bg-amber-550/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 rounded-3xl backdrop-blur-2xl bg-white/40 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 text-center relative z-10 shadow-2xl"
        >
          {/* Card Border Ornament */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-red-650 dark:border-red-500 opacity-60" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-red-650 dark:border-red-500 opacity-60" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-red-650 dark:border-red-500 opacity-60" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-red-650 dark:border-red-500 opacity-60" />

          <div className="text-center mb-8 relative">
            <div className="p-4 bg-gradient-to-br from-red-600 to-red-500 text-white rounded-2xl w-fit mx-auto mb-4 shadow-md shadow-red-550/20">
              <ShieldCheck size={28} className="animate-pulse" />
            </div>
            <h2 className="text-2xl md:text-3xl font-serif-heading font-black text-slate-900 dark:text-white uppercase tracking-wider">Hồ Sơ Sĩ Tử</h2>
            <p className="mt-2 text-xs font-serif-body text-slate-500 dark:text-slate-400 italic">Đăng ký danh tính trước khi bước vào đấu trường</p>
            <div className="w-16 h-0.5 bg-red-650 dark:bg-red-500 mx-auto mt-4" />
          </div>

          <form onSubmit={handleJoin} className="space-y-6 text-left relative z-10">
            <div>
              <label className="block text-[10px] font-sans font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Đồng chí nhập tên điểm danh</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ví dụ: Hoàng Văn Thụ, Trần Phú..."
                  className="w-full pl-11 pr-4 py-3.5 text-sm font-sans font-bold text-slate-800 dark:text-white bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all placeholder-slate-400 dark:placeholder-slate-600"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={20}
                  required
                />
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 font-sans font-black text-xs text-white bg-gradient-to-r from-red-650 to-amber-600 hover:from-red-600 hover:to-amber-500 rounded-xl hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 transition-all uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-650/15"
            >
              <Play size={12} fill="white" /> Bắt Đầu Khóa Thi
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 2. Màn hình Hoàn Thành (Kết Quả & Bảng Xem Lại Chi Tiết)
  if (isFinished) {
    const totalQuestions = sessionQuiz.length || QUIZ_SESSION_COUNT;
    const pct = Math.round((score / totalQuestions) * 100);
    
    // Evaluate rank title
    let rankTitle = 'Bình Binh';
    let rankColor = 'text-slate-500 dark:text-slate-400';
    let rankBg = 'bg-slate-500/10 border-slate-500/20';
    if (pct >= 90) {
      rankTitle = 'Trạng Nguyên Khoa Bảng';
      rankColor = 'text-amber-600 dark:text-amber-400';
      rankBg = 'bg-amber-500/10 border-amber-500/20';
    } else if (pct >= 75) {
      rankTitle = 'Bảng Nhãn Lý Luận';
      rankColor = 'text-red-600 dark:text-red-400';
      rankBg = 'bg-red-500/10 border-red-500/20';
    } else if (pct >= 55) {
      rankTitle = 'Sĩ Tử Ưu Tú';
      rankColor = 'text-emerald-600 dark:text-emerald-400';
      rankBg = 'bg-emerald-500/10 border-emerald-500/20';
    }

    return (
      <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-gradient-to-br from-[#FAF8F5] via-[#FDF9F2] to-[#FAF8F5] dark:from-[#0B0D17] dark:via-[#12162A] dark:to-[#0B0D17] relative overflow-hidden pt-28 pb-16">
        <Link 
          href="/quiz"
          className="fixed z-50 px-3.5 py-2 text-[10px] font-sans font-black uppercase tracking-widest text-white bg-gradient-to-r from-red-650 to-red-600 hover:from-red-600 hover:to-red-500 border border-red-750 dark:border-red-500 rounded-xl top-20 right-4 shadow-md shadow-red-650/15 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-md"
        >
          Thoát chế độ
        </Link>
        <div className="absolute top-[10%] left-[10%] w-[35vw] h-[35vw] bg-red-650/5 dark:bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-2xl space-y-6 relative z-10">
          
          {/* Main Dashboard Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl backdrop-blur-2xl bg-white/40 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 text-center shadow-2xl relative overflow-hidden"
          >
            {/* Ambient gold star container */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="p-4 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl w-fit mx-auto mb-4">
              <Award size={36} className="animate-bounce" />
            </div>
            
            <h2 className="text-3xl font-serif-heading font-black text-slate-900 dark:text-white uppercase tracking-wider">Hoàn Thành Sát Hạch</h2>
            <div className="w-16 h-0.5 bg-slate-200 dark:bg-slate-800 mx-auto my-4"></div>
            
            <div className="text-sm font-serif-body text-slate-500 dark:text-slate-400 italic mb-6">
              Kế hoạch bài làm của đồng chí <strong className="text-slate-900 dark:text-white not-italic">{playerName}</strong>
            </div>

            {/* Circular Gauge */}
            <div className="inline-block relative mb-6">
              <svg width="150" height="150" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="6" />
                <motion.circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke={pct >= 75 ? "#EF4444" : pct >= 55 ? "#10B981" : "#6B7280"} strokeWidth="7"
                  strokeLinecap="round" strokeDasharray={314}
                  initial={{ strokeDashoffset: 314 }}
                  animate={{ strokeDashoffset: 314 - (314 * pct) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{pct}%</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">{score} / {totalQuestions} Câu</span>
              </div>
            </div>

            {/* Rank Evaluation Tag */}
            <div className="mb-8">
              <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border font-serif-heading font-black text-sm uppercase tracking-wider shadow-sm ${rankBg} ${rankColor}`}>
                🏅 Cấp bậc: {rankTitle}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-serif-body italic mt-3.5 max-w-sm mx-auto">
                {pct >= 75 ? "Xin chúc mừng đồng chí đã nắm vững lý luận Hiến pháp và lịch sử xây dựng nước nhà." : "Đồng chí cần nghiên cứu thêm các tài liệu, hồ sơ tư liệu lịch sử được tích hợp trong hệ thống."}
              </p>
            </div>

            <button
              onClick={handleRestart}
              className="w-full py-4 font-sans font-black text-xs text-slate-700 hover:text-red-650 dark:text-slate-350 dark:hover:text-white bg-slate-100 hover:bg-slate-200/50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800/50 rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw size={12} /> Làm bài thi mới
            </button>
          </motion.div>

          {/* Detailed Question Review List */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-3xl backdrop-blur-2xl bg-white/40 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-250/20 dark:border-slate-800/20">
              <BookOpen size={18} className="text-red-650 dark:text-red-400" />
              <h3 className="text-lg font-serif-heading font-black text-slate-900 dark:text-white uppercase tracking-wider">Hồ Sơ Chi Tiết Bài Làm</h3>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {sessionQuiz.map((item, index) => {
                const answer = userAnswers[index];
                const isCorrect = answer === item.correctIndex;
                const isExpanded = expandedReviewIdx === index;

                return (
                  <div 
                    key={index}
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                      isCorrect 
                        ? 'bg-emerald-500/5 border-emerald-500/20 dark:border-emerald-500/10' 
                        : 'bg-red-500/5 border-red-500/20 dark:border-red-500/10'
                    }`}
                  >
                    {/* Collapsed Header Bar */}
                    <button
                      onClick={() => setExpandedReviewIdx(isExpanded ? null : index)}
                      className="w-full p-4 flex justify-between items-center text-left gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          isCorrect ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                        }`}>
                          {index + 1}
                        </span>
                        <p className="text-xs font-serif-heading font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {item.question}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {isCorrect ? (
                          <span className="text-[10px] font-sans font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle size={10} /> Đúng
                          </span>
                        ) : (
                          <span className="text-[10px] font-sans font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <XCircle size={10} /> Sai
                          </span>
                        )}
                        {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                    </button>

                    {/* Expanded Content Panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden border-t border-slate-200/10 dark:border-slate-800/10"
                        >
                          <div className="p-4 space-y-3 text-xs bg-black/[0.02] dark:bg-white/[0.01]">
                            <p className="font-serif-heading font-bold text-slate-900 dark:text-white text-sm">
                              {item.question}
                            </p>
                            
                            {/* Options List */}
                            <div className="space-y-2 pt-1">
                              {item.options.map((opt, oIdx) => {
                                const isSelected = oIdx === answer;
                                const isCorrectOpt = oIdx === item.correctIndex;
                                
                                let optStyle = "bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-350";
                                if (isCorrectOpt) {
                                  optStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold";
                                } else if (isSelected) {
                                  optStyle = "bg-red-500/10 border-red-500/30 text-red-650 dark:text-red-400 font-bold";
                                }

                                return (
                                  <div key={oIdx} className={`p-3 border rounded-xl flex items-center gap-3 ${optStyle}`}>
                                    <span className={`w-5 h-5 flex items-center justify-center rounded-md text-[10px] font-black border ${
                                      isCorrectOpt ? 'bg-emerald-500 text-white border-emerald-500' : isSelected ? 'bg-red-550 text-white border-red-500' : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400'
                                    }`}>
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <span>{opt}</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation details */}
                            <div className="p-3.5 bg-slate-500/5 border border-slate-200/10 dark:border-slate-800/10 rounded-xl mt-3">
                              <p className="font-serif-heading font-black uppercase text-[10px] text-slate-400 dark:text-slate-500 tracking-wider mb-1">Cơ sở lý luận & Giải thích</p>
                              <p className="font-serif-body text-slate-650 dark:text-slate-300 leading-relaxed">
                                {item.explanation}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    );
  }

  // 3. Màn hình làm bài thi chính (Answering Question)
  const q = sessionQuiz[currentIdx];
  const hasAnswered = selectedAnswer !== null;
  const isCorrectAnswer = hasAnswered && selectedAnswer === q?.correctIndex;
  const correctLabel = q ? String.fromCharCode(65 + q.correctIndex) : '';

  if (!q) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FDF9F2] to-[#FAF8F5] dark:from-[#0B0D17] dark:via-[#12162A] dark:to-[#0B0D17] transition-colors duration-500 relative overflow-hidden pb-16 pt-28">
      <Link 
        href="/quiz"
        className="fixed z-50 px-3.5 py-2 text-[10px] font-sans font-black uppercase tracking-widest text-white bg-gradient-to-r from-red-650 to-red-600 hover:from-red-600 hover:to-red-500 border border-red-750 dark:border-red-500 rounded-xl top-20 right-4 shadow-md shadow-red-650/15 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-md"
      >
        Thoát chế độ
      </Link>
      {/* Background Ambient Lights */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[15%] left-[5%] w-[35vw] h-[35vw] bg-red-650/5 dark:bg-red-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[15%] right-[5%] w-[35vw] h-[35vw] bg-amber-500/5 dark:bg-amber-550/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
        
        {/* Progress header bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 flex justify-between items-center shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-red-650 text-white font-sans font-black text-[10px] uppercase tracking-widest rounded-lg">
              Câu {currentIdx + 1} / {sessionQuiz.length}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-sans font-bold text-slate-500 dark:text-slate-400">
            <Timer size={14} className="text-red-650 dark:text-red-400" />
            <span>Đấu trường cá nhân: {playerName}</span>
          </div>
        </motion.div>

        {/* Dynamic Energy Timer Line */}
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: `${((currentIdx + 1) / sessionQuiz.length) * 100}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-gradient-to-r from-red-650 to-amber-500"
          />
        </div>

        {/* Question Panel */}
        <motion.div 
          key={currentIdx}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="p-6 md:p-8 rounded-3xl backdrop-blur-2xl bg-white/45 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 text-center shadow-md relative"
        >
          <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-red-500 opacity-40" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-red-500 opacity-40" />
          
          <h2 className="text-lg md:text-xl lg:text-2xl font-serif-heading font-black text-slate-900 dark:text-white leading-snug">
            {q.question}
          </h2>
        </motion.div>

        {/* Explanation Collapse Box */}
        <AnimatePresence>
          {hasAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-5 rounded-2xl border shadow-sm ${
                isCorrectAnswer 
                  ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-400' 
                  : 'bg-red-500/5 dark:bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-sans font-black text-xs ${
                  isCorrectAnswer ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-550/10 text-red-600'
                }`}>
                  {isCorrectAnswer ? '✓' : '!'}
                </span>
                <div className="flex-1">
                  <h4 className="font-serif-heading font-black text-sm uppercase">
                    {isCorrectAnswer ? 'Đáp án hoàn hảo!' : 'Chưa chính xác'}
                  </h4>
                  <p className="text-xs font-serif-body mt-1 text-slate-800 dark:text-slate-200">
                    Đáp án đúng là: <strong className="underline decoration-2 underline-offset-4">{correctLabel}. {q.options[q.correctIndex]}</strong>
                  </p>
                  <p className="text-xs font-serif-body mt-2.5 leading-relaxed opacity-90 border-t border-current/10 pt-2.5">
                    <strong>Giải thích:</strong> {q.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Options grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.options.map((opt, idx) => {
            const isSelected = idx === selectedAnswer;
            const isCorrectOpt = idx === q.correctIndex;
            
            let buttonStyle = "border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-850 dark:text-slate-200 hover:border-red-500/40 hover:bg-slate-50 dark:hover:bg-slate-850/50";
            let badgeStyle = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/50";
            let opacity = "";

            if (hasAnswered) {
              opacity = "opacity-50";
              if (isCorrectOpt) {
                buttonStyle = "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450";
                badgeStyle = "bg-emerald-500 text-white border-emerald-500";
                opacity = "opacity-100 scale-[1.01]";
              } else if (isSelected) {
                buttonStyle = "border-red-500/50 bg-red-500/10 text-red-650 dark:text-red-400";
                badgeStyle = "bg-red-550 text-white border-red-500";
                opacity = "opacity-100 scale-[1.01]";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={hasAnswered}
                className={`p-4 min-h-[90px] border rounded-2xl flex items-center gap-4 text-left transition-all backdrop-blur-md ${buttonStyle} ${opacity} ${!hasAnswered ? 'hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-sm' : 'cursor-default'}`}
              >
                <span className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl font-bold text-sm border ${badgeStyle}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="font-serif-heading font-bold text-xs md:text-sm leading-snug w-full">
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
