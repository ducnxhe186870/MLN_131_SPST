import React from "react";
import {
  Star,
  Flag,
  Landmark,
  Vote,
  Award,
  TrendingUp,
  Scale,
} from "lucide-react";

export interface Milestone {
  year: string;
  label: string;
  icon: React.ReactNode;
  accent: string;
  headline: string;
  body: string;
  highlight?: string;
  image: string;
  imageCaption: string;
  detailContent: string[];
  detailBullets: string[];
  sourceLink?: string;
}

export const PHASE_1: Milestone[] = [
  {
    year: "1975",
    label: "30/4",
    icon: <Flag size={28} />,
    accent: "#DA251D",
    headline: "Thống Nhất Đất Nước",
    body: "Chiến dịch Hồ Chí Minh toàn thắng, giải phóng miền Nam, chính thức khép lại 21 năm kháng chiến chống Mỹ đầy gian khổ và hy sinh.",
    highlight: "Sức mạnh tổng hợp",
    image: "/images/thong_nhat_1975.png",
    imageCaption: "Niềm hân hoan của nhân dân trong ngày đất nước hoàn toàn giải phóng, non sông thu về một mối.",
    detailContent: [
      "Sau đại thắng mùa Xuân năm 1975, nền hòa bình và độc lập của Việt Nam cuối cùng đã được thiết lập. Thắng lợi vĩ đại này là kết tinh của máu, nước mắt và tinh thần kiên cường của toàn dân tộc suốt hơn 2 thập kỷ.",
      "Về mặt chính trị, sự thống nhất và độc lập đã tạo ra một 'Sức mạnh tổng hợp' vô cùng to lớn từ lòng dân. Sự đoàn kết toàn dân tộc được củng cố vững chắc hơn bao giờ hết, là bệ phóng tinh thần cho công cuộc tái thiết đất nước.",
      "Tuy nhiên, niềm vui độc lập đan xen với những thử thách khổng lồ. Đất nước bước vào thời kỳ quá độ lên chủ nghĩa xã hội từ một nền sản xuất nhỏ, nông nghiệp lạc hậu. Hậu quả chiến tranh để lại tàn dư nặng nề, cơ sở hạ tầng bị tàn phá, ruộng đồng đầy rẫy bom mìn, hàng triệu người mang thương tật, đòi hỏi một nguồn lực khổng lồ để khắc phục.",
      "Về mặt quốc tế, bối cảnh phức tạp cũng đặt ra nhiều chông gai. Sự rạn nứt bên trong phe xã hội chủ nghĩa phần nào bộc lộ những khó khăn về mô hình phát triển. Cùng lúc đó, các thế lực thù địch tiếp tục âm mưu bao vây, cấm vận và phá hoại sự phát triển của Việt Nam non trẻ."
    ],
    detailBullets: [
      "Toàn thắng ngày 30/4/1975 mang lại hòa bình, độc lập và tự do.",
      "Chính trị: Tạo ra 'Sức mạnh tổng hợp' từ lòng dân và đoàn kết toàn dân tộc.",
      "Kinh tế: Quá độ từ nền sản xuất nhỏ, trình độ kinh tế - xã hội rất thấp.",
      "Xã hội: Hậu quả chiến tranh bom đạn nặng nề, đòi hỏi nguồn lực khổng lồ tái thiết.",
      "Quốc tế: Phe XHCN rạn nứt, các thế lực thù địch bao vây cấm vận."
    ],
    sourceLink: "https://tulieuvankien.dangcongsan.vn/",
  },
  {
    year: "1975",
    label: "Tháng 8",
    icon: <Star size={28} />,
    accent: "#c0392b",
    headline: "Hội nghị TW 24",
    body: "Ban Chấp hành Trung ương Đảng khóa III họp Hội nghị lần thứ 24, đề ra đường lối chiến lược hoàn thành thống nhất nước nhà.",
    highlight: "Quyết sách cực kỳ cấp bách",
    image: "/images/hoi_nghi_tw24.png",
    imageCaption: "Hội nghị Trung ương 24 khóa III đã đưa ra quyết sách then chốt về việc thống nhất đất nước.",
    detailContent: [
      "Tháng 8/1975, Ban Chấp hành Trung ương Đảng khóa III tiến hành Hội nghị lần thứ 24. Hội nghị nhận định rằng, sau khi giải phóng, nước ta vẫn tồn tại hai chính quyền: Nhà nước Pháp quyền Xã hội Chủ nghĩa Việt Nam (miền Bắc) và Chính phủ Cách mạng lâm thời Cộng hòa miền Nam Việt Nam (miền Nam).",
      "Hội nghị chủ trương: Hoàn thành thống nhất nước nhà và đưa cả nước tiến nhanh, tiến mạnh, tiến vững chắc lên chủ nghĩa xã hội. Đây không chỉ là nhu cầu chính trị mà là quy luật khách quan của cách mạng.",
      "Theo đó, miền Bắc tiếp tục xây dựng, phát triển CNXH và hoàn thiện quan hệ sản xuất XHCN. Đồng thời, miền Nam vừa tiến hành cải tạo, vừa xây dựng chủ nghĩa xã hội.",
      "Thống nhất đất nước về mặt Nhà nước càng sớm sẽ càng phát huy sức mạnh mới của dân tộc, đồng thời ngăn ngừa và phá tan triệt để các âm mưu chia rẽ của các thế lực phản động trong và ngoài nước."
    ],
    detailBullets: [
      "Hội nghị TW 24 khóa III họp tháng 8/1975.",
      "Chủ trương định hướng: Hoàn thành thống nhất nước nhà về mặt nhà nước.",
      "Miền Bắc: Tiếp tục xây dựng CNXH, hoàn thiện quan hệ sản xuất.",
      "Miền Nam: Tiến hành cải tạo và xây dựng CNXH đồng thời.",
      "Ý nghĩa: Phát huy sức mạnh, phá tan âm mưu chia rẽ của thế lực thù địch."
    ],
    sourceLink: "https://tulieuvankien.dangcongsan.vn/van-kien-dang-toan-tap/tap-36-1975-6019",
  },
  {
    year: "1975",
    label: "Tháng 11",
    icon: <Landmark size={28} />,
    accent: "#e74c3c",
    headline: "Hội nghị Hiệp thương Bắc – Nam",
    body: "Hai đoàn đại biểu từ miền Bắc và miền Nam tiến hành hội nghị lịch sử tại Sài Gòn, thống nhất quan điểm tổ chức Tổng tuyển cử chung.",
    highlight: "Đồng lòng thống nhất",
    image: "/images/hoi_nghi_hiep_thuong.png",
    imageCaption: "Quang cảnh trang nghiêm của Hội nghị Hiệp thương chính trị tổ chức tại Sài Gòn.",
    detailContent: [
      "Quá trình chuẩn bị cho sự hợp nhất về mặt Nhà nước diễn ra hết sức khẩn trương và dân chủ. Ngày 27/10/1975, Ủy ban Thường vụ Quốc hội Nhà nước Pháp quyền Xã hội Chủ nghĩa Việt Nam đã cử đoàn đại biểu 25 thành viên do Chủ tịch Trường Chinh làm Trưởng đoàn.",
      "Chỉ ít ngày sau, ngày 05-06/11/1975, Ủy ban Trung ương Mặt trận Dân tộc giải phóng miền Nam Việt Nam cũng cử đoàn 25 đại biểu do đồng chí Phạm Hùng lãnh đạo.",
      "Từ ngày 15 đến 21/11/1975, Hội nghị Hiệp thương chính trị giữa hai đoàn đại biểu Bắc - Nam đã diễn ra tại Sài Gòn. Hội nghị thảo luận sôi nổi và đạt được sự nhất trí tuyệt đối.",
      "Hội nghị khẳng định sự cần thiết tất yếu của việc thống nhất về mặt Nhà nước thông qua một cuộc Tổng tuyển cử chung trong cả nước. Nguyên tắc bầu cử được thống nhất là: dân chủ, phổ thông, bình đẳng, trực tiếp và bỏ phiếu kín."
    ],
    detailBullets: [
      "Đoàn miền Bắc (27/10) do đồng chí Trường Chinh làm Trưởng đoàn.",
      "Đoàn miền Nam (05-06/11) do đồng chí Phạm Hùng làm Trưởng đoàn.",
      "Hội nghị Hiệp thương diễn ra tại Sài Gòn từ 15 đến 21/11/1975.",
      "Khẳng định sự cần thiết phải thống nhất đất nước về mặt nhà nước.",
      "Chốt phương thức qua Tổng tuyển cử: Phổ thông, bình đẳng, trực tiếp, bỏ phiếu kín."
    ],
    sourceLink: "https://tulieuvankien.dangcongsan.vn/ho-so-su-kien-nhan-chung/su-kien-va-nhan-chung/hoi-nghi-hiep-thuong-chinh-tri-thong-nhat-dat-nuoc-3687",
  },
  {
    year: "1976",
    label: "25/4",
    icon: <Vote size={28} />,
    accent: "#DA251D",
    headline: "Tổng Tuyển Cử Lịch Sử",
    body: "Lần đầu tiên sau nhiều thập kỷ chia cắt, toàn thể nhân dân hai miền Nam - Bắc cùng nô nức cầm lá phiếu bầu ra Quốc hội chung của nước Việt Nam.",
    highlight: "Ngày hội non sông",
    image: "/images/tong_tuyen_cu_1976.png",
    imageCaption: "Cử tri trên khắp mọi miền tổ quốc tin tưởng bỏ lá phiếu bầu ra Quốc hội chung.",
    detailContent: [
      "Vào ngày 25/04/1976, sự kiện trọng đại được mong chờ nhất đã diễn ra: Cuộc Tổng tuyển cử bầu Quốc hội chung cho cả nước. Đây là một ngày hội lớn của non sông, khi hàng chục triệu cử tri từ Ải Nam Quan đến Mũi Cà Mau được thực hiện quyền làm chủ thực sự.",
      "Cuộc bầu cử tuân thủ nghiêm ngặt các nguyên tắc dân chủ đã được Hội nghị Hiệp thương đề ra trước đó. Ý chí mạnh mẽ của nhân dân không chỉ được thể hiện qua tỷ lệ đi bầu kỷ lục mà còn qua niềm hy vọng cháy bỏng về một tương lai thịnh vượng.",
      "Sự thành công của cuộc Tổng tuyển cử đã tạo nền tảng pháp lý tối cao cho việc hoàn thiện bộ máy chính quyền Nhà nước thống nhất, chấm dứt hoàn toàn về mặt pháp lý trạng thái tồn tại hai chính quyền."
    ],
    detailBullets: [
      "Tiến hành ngày 25/04/1976 trên phạm vi toàn quốc.",
      "Cuộc Tổng tuyển cử bầu ra Quốc hội nước Việt Nam thống nhất.",
      "Thực hiện theo nguyên tắc dân chủ, phổ thông, trực tiếp, bỏ phiếu kín.",
      "Đánh dấu ngày hội lớn của toàn dân, thể hiện ý chí làm chủ.",
      "Tạo cơ sở pháp lý vững chắc cho việc kiện toàn bộ máy Nhà nước."
    ],
    sourceLink: "https://quochoi.vn/gioithieu/Pages/qua-trinh-phat-trien.aspx?ItemID=18",
  },
  {
    year: "1976",
    label: "Đại hội IV",
    icon: <Award size={28} />,
    accent: "#c0392b",
    headline: "Xây dựng CNXH & Bảo vệ Tổ quốc",
    body: "Đại hội IV của Đảng chính thức vạch ra đường lối tiến lên chủ nghĩa xã hội trên phạm vi cả nước sau khi hoàn thành thống nhất Nhà nước.",
    highlight: "Giai đoạn bản lề",
    image: "/images/bo_chinh_tri.png",
    imageCaption: "Các nhà lãnh đạo Đảng và Nhà nước bàn thảo đường lối kiến thiết đất nước tại Đại hội IV.",
    detailContent: [
      "Tiếp nối thành công của việc kiện toàn bộ máy Nhà nước thống nhất, Đại hội đại biểu toàn quốc lần thứ IV của Đảng được triệu tập. Đây là Đại hội có ý nghĩa lịch sử vô cùng to lớn đối với tương lai dân tộc.",
      "Đại hội IV có sứ mệnh vừa tổng kết những kinh nghiệm quý báu của cuộc kháng chiến vĩ đại vừa qua, vừa phác thảo cương lĩnh, đường lối cho cách mạng Việt Nam trong giai đoạn hoàn toàn mới.",
      "Nhiệm vụ trung tâm xuyên suốt là 'Đảng lãnh đạo cả nước xây dựng chủ nghĩa xã hội và bảo vệ Tổ quốc'. Đại hội đã đề ra đường lối chung, nhấn mạnh việc thực hiện đồng thời 3 cuộc cách mạng (quan hệ sản xuất, khoa học kỹ thuật, tư tưởng văn hóa).",
      "Tuy nhiên, do bối cảnh khó khăn chồng chất, vừa phải tái thiết sau chiến tranh, vừa phải chống lại sự cấm vận và chiến tranh biên giới, quá trình thực hiện Nghị quyết Đại hội gặp muôn vàn thách thức."
    ],
    detailBullets: [
      "Đại hội IV định hình con đường tiến lên CNXH trên phạm vi cả nước.",
      "Nhiệm vụ kép: Xây dựng CNXH gắn liền với Bảo vệ Tổ quốc.",
      "Tổng kết kinh nghiệm kháng chiến và đề ra chiến lược mới.",
      "Đẩy mạnh 3 cuộc cách mạng: Quan hệ sản xuất, KH-KT, tư tưởng văn hóa.",
      "Luôn phải đối mặt với khó khăn chồng chất từ cấm vận và hậu quả chiến tranh."
    ],
    sourceLink: "https://tulieuvankien.dangcongsan.vn/ban-chap-hanh-trung-uong-dang/dai-hoi-dang/lan-thu-iv",
  }
];

export const PHASE_2: Milestone[] = [
  {
    year: "1982",
    label: "Tháng 3",
    icon: <Landmark size={28} />,
    accent: "#1a5276",
    headline: "Đại hội V",
    body: "Đại hội V của Đảng tiếp tục khẳng định đường lối chung, đồng thời đánh giá khách quan về những khó khăn trong chặng đường đầu tiên của thời kỳ quá độ.",
    highlight: "Nhìn nhận thực tế",
    image: "/images/san_xuat_kinh_te.png",
    imageCaption: "Hoạt động sản xuất kinh tế thời kỳ đầu được đẩy mạnh để giải quyết khó khăn đời sống.",
    detailContent: [
      "Đại hội đại biểu toàn quốc lần thứ V của Đảng Cộng sản Việt Nam họp từ ngày 27-31/03/1982 tại Hà Nội. Đại hội diễn ra trong bối cảnh nền kinh tế - xã hội đang gặp rất nhiều khó khăn và mất cân đối nghiêm trọng.",
      "Đại hội V tiếp tục khẳng định hai nhiệm vụ chiến lược: Xây dựng thành công chủ nghĩa xã hội và sẵn sàng chiến đấu, bảo vệ vững chắc Tổ quốc Việt Nam XHCN. Hai nhiệm vụ này có quan hệ mật thiết và hỗ trợ lẫn nhau.",
      "Đại hội đã chỉ ra rằng nước ta đang ở chặng đường đầu tiên của thời kỳ quá độ. Trong chặng đường này, nền kinh tế còn rất yếu kém, nông nghiệp và công nghiệp nhẹ chưa đáp ứng đủ nhu cầu thiết yếu.",
      "Một quyết định quan trọng của Đại hội V là coi nông nghiệp là mặt trận hàng đầu, tập trung sức giải quyết vấn đề lương thực, thực phẩm và hàng tiêu dùng. Đây là bước điều chỉnh chiến lược quan trọng so với trước đây."
    ],
    detailBullets: [
      "Đại hội V họp từ 27-31/03/1982, đối diện với muôn vàn khó khăn kinh tế.",
      "Tiếp tục thực hiện 2 nhiệm vụ chiến lược: Xây dựng CNXH và Bảo vệ Tổ quốc.",
      "Khẳng định nước ta đang ở chặng đường đầu tiên của thời kỳ quá độ.",
      "Điều chỉnh chiến lược: Coi nông nghiệp là mặt trận hàng đầu.",
      "Tập trung giải quyết vấn đề lương thực, thực phẩm và hàng tiêu dùng."
    ],
    sourceLink: "https://tulieuvankien.dangcongsan.vn/ban-chap-hanh-trung-uong-dang/dai-hoi-dang/lan-thu-v",
  },
  {
    year: "1982-1986",
    label: "Thực Hiện",
    icon: <TrendingUp size={28} />,
    accent: "#2c3e50",
    headline: "Quá trình thực hiện Nghị quyết",
    body: "Quá trình thực hiện Nghị quyết Đại hội V gặp vô vàn trở ngại do cơ chế bao cấp rập khuôn, lạm phát phi mã và đời sống nhân dân cực kỳ khó khăn.",
    highlight: "Khủng hoảng & bế tắc",
    image: "/images/chien_dau_bien_gioi.png",
    imageCaption: "Bên cạnh khó khăn kinh tế, quân và dân ta vẫn kiên cường bảo vệ biên cương.",
    detailContent: [
      "Quá trình đưa Nghị quyết Đại hội V vào cuộc sống là một cuộc vật lộn cam go. Giai đoạn 1982-1986, đất nước rơi vào khủng hoảng kinh tế - xã hội trầm trọng nhất kể từ sau khi thống nhất.",
      "Lạm phát phi mã (lên đến con số hơn 700% vào năm 1986), sản xuất đình đốn, phân phối lưu thông ách tắc. Chế độ tem phiếu bao cấp bộc lộ sự cứng nhắc, triệt tiêu động lực và kìm hãm sức sản xuất.",
      "Hàng hóa thiết yếu cực kỳ khan hiếm, đời sống của người lao động, cán bộ công nhân viên và các lực lượng vũ trang vô cùng khó khăn. Áp lực từ thực tế sinh động đòi hỏi Đảng phải dũng cảm nhìn thẳng vào sự thật, đánh giá đúng sự thật.",
      "Sự bế tắc này đã tạo ra sức ép khổng lồ từ thực tiễn cơ sở, buộc bộ máy lãnh đạo phải thai nghén những tư duy mới, nung nấu những bước đột phá nhằm cứu vãn nền kinh tế."
    ],
    detailBullets: [
      "Khủng hoảng kinh tế - xã hội trầm trọng nhất kể từ sau 1975.",
      "Lạm phát phi mã, sản xuất đình đốn, phân phối bế tắc.",
      "Cơ chế tập trung quan liêu bao cấp triệt tiêu mọi động lực phát triển.",
      "Đời sống nhân dân và lực lượng vũ trang vô cùng cực khổ.",
      "Sức ép từ thực tiễn cơ sở buộc phải đổi mới cách làm."
    ],
    sourceLink: "https://tulieuvankien.dangcongsan.vn/",
  },
  {
    year: "1986",
    label: "Đột phá",
    icon: <Scale size={28} />,
    accent: "#1a5276",
    headline: "Các bước đột phá kinh tế",
    body: "Những bước đột phá trong tư duy kinh tế của Đảng dần hình thành, thừa nhận sản xuất hàng hóa, xóa bỏ bao cấp và mở đường cho công cuộc Đổi Mới toàn diện.",
    highlight: "Thai nghén Đổi Mới",
    image: "/images/bo_chinh_tri.png",
    imageCaption: "Hội nghị Bộ Chính trị đánh dấu sự lột xác trong tư duy kinh tế, chuẩn bị cho Đại hội VI.",
    detailContent: [
      "Để thoát khỏi khủng hoảng, từ nỗ lực xé rào ở cơ sở đến những quyết định ở trung ương, các bước đột phá tiếp tục đổi mới kinh tế (1982-1986) đã được định hình.",
      "Bắt đầu từ những thay đổi như 'Khoán 100' trong nông nghiệp, hay 'kế hoạch 3 phần' trong công nghiệp (1981), cho đến sự ra đời của Nghị quyết Hội nghị TW 8 (khóa V) vào tháng 6/1985 về Giá - Lương - Tiền.",
      "Đỉnh cao của sự đột phá tư duy trước thềm Đại hội VI là Kết luận của Bộ Chính trị (tháng 8/1986). Bản Kết luận lịch sử này đã thẳng thắn thừa nhận nền kinh tế nước ta đang tồn tại cấu trúc hàng hóa nhiều thành phần.",
      "Chủ trương cốt lõi là dứt khoát xóa bỏ cơ chế quản lý kinh tế tập trung quan liêu, bao cấp, chuyển hẳn sang hạch toán kinh doanh xã hội chủ nghĩa. Đây là bước lột xác về tư duy lý luận, dọn đường trực tiếp cho Đường lối Đổi mới toàn diện tại Đại hội VI (12/1986)."
    ],
    detailBullets: [
      "Sự vận động đổi mới đi từ thực tiễn cơ sở (xé rào) lên Trung ương.",
      "Nghị quyết TW 8 (6/1985) bước đầu giải quyết khâu Giá - Lương - Tiền.",
      "Kết luận của Bộ Chính trị (8/1986) là bước đột phá tư duy quyết định.",
      "Thừa nhận nền kinh tế hàng hóa nhiều thành phần.",
      "Chủ trương dứt khoát xóa bỏ bao cấp, chuyển sang hạch toán kinh doanh."
    ],
    sourceLink: "https://tulieuvankien.dangcongsan.vn/ban-chap-hanh-trung-uong-dang/dai-hoi-dang/lan-thu-vi",
  }
];
