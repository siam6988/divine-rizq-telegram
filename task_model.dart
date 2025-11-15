class Task {
  final String id;
  final String title;
  final String type; // website, youtube, download, video, quiz, daily, code
  final String verificationCode;
  final double reward;
  final int timeLimit;
  final int requiredClicks;
  final String instruction;
  final String? link;
  final String? correctAnswer;
  final int quota;
  final bool isActive;
  
  Task({
    required this.id,
    required this.title,
    required this.type,
    required this.verificationCode,
    required this.reward,
    required this.timeLimit,
    required this.requiredClicks,
    required this.instruction,
    this.link,
    this.correctAnswer,
    required this.quota,
    required this.isActive,
  });
  
  factory Task.fromFirestore(DocumentSnapshot doc) {
    Map data = doc.data() as Map<String, dynamic>;
    return Task(
      id: doc.id,
      title: data['title'] ?? '',
      type: data['type'] ?? 'website',
      verificationCode: data['code'] ?? '',
      reward: (data['reward'] ?? 0).toDouble(),
      timeLimit: data['timeLimit'] ?? 30,
      requiredClicks: data['requiredClicks'] ?? 1,
      instruction: data['instruction'] ?? '',
      link: data['link'],
      correctAnswer: data['correctAnswer'],
      quota: data['quota'] ?? 100,
      isActive: data['status'] == 'active',
    );
  }
}
