class CmhConstants {
  static const CmhContributor originalIdea = CmhContributor(
    name: "Richard REY (aka Rexy)",
    link: "https://github.com/rexy74",
  );
  static const List<CmhContribution> designDevProject = [
    CmhContribution(
      date: "2015-2017",
      contributors: [
        CmhContributor(
          name: "Raphaël PION",
        ),
        CmhContributor(
          name: "Hugo MEZIANI",
        ),
      ],
    ),
    CmhContribution(
      date: "2016",
      contributors: [
        CmhContributor(
          name: "Tom HOUDAYER",
          link: "https://github.com/Tom-H-",
        ),
      ],
    ),
    CmhContribution(
      date: "2017",
      contributors: [
        CmhContributor(
          name: "Catatrina DE FARIA CRISTAS",
          link: "https://github.com/catarinadf",
        ),
        CmhContributor(
          name: "Aurélien DUBOIS",
        ),
      ],
    ),
    CmhContribution(
      date: "2021-2022",
      contributors: [
        CmhContributor(
          name: "Sylvain BOUTEILLER",
          link: "https://github.com/Shiluba",
        ),
        CmhContributor(
          name: "Mathis CADIO",
          link: "https://github.com/mathis-kdio",
        ),
      ],
    ),
    CmhContribution(
      date: "2022-2023",
      contributors: [
        CmhContributor(
          name: "Ghassen LAHDHIRI",
          link: "https://github.com/ghassenl",
        ),
        CmhContributor(
          name: "Ahmed BOUSRIH",
          link: "https://github.com/Ahmed-Bousrih",
        ),
        CmhContributor(
          name: "Mehdi BELAJOUZA",
          link: "https://github.com/Mehdi-Belajouza",
        ),
      ],
    ),
    CmhContribution(
      date: "2023-2024",
      contributors: [
        CmhContributor(
          name: "Adrien SCHNEIDER",
        ),
        CmhContributor(
          name: "Cyril LEBLAY",
        ),

      ],
    ),
  ];
}

class CmhContributor {
  final String name;
  final String? link;

  const CmhContributor({
    required this.name,
    this.link,
  });
}

class CmhContribution {
  final List<CmhContributor> contributors;
  final String date;

  const CmhContribution({
    required this.contributors,
    required this.date,
  });
}
