import {
  groupInvitationsByDate,
  NOTIF_GROUP_ORDER,
} from "../groupInvitationsByDate";

// Les groupes suivent le calendrier local de l'utilisateur : les dates de test
// sont donc construites en heure locale, sinon le résultat dépendrait du
// fuseau de la machine qui exécute la suite.
const NOW = new Date(2026, 2, 15, 10);
const at = (date: Date) => ({ createdAt: date.toISOString() });

describe("groupInvitationsByDate", () => {
  it("should group an item created the same day under today", () => {
    // Arrange
    const items = [at(new Date(2026, 2, 15, 1))];

    // Act
    const groups = groupInvitationsByDate(items, NOW);

    // Assert
    expect(groups).toEqual([{ key: "today", items }]);
  });

  it("should group an item created the previous day under yesterday", () => {
    const groups = groupInvitationsByDate([at(new Date(2026, 2, 14, 23))], NOW);

    expect(groups[0].key).toBe("yesterday");
  });

  it("should group an item created three days ago under thisWeek", () => {
    const groups = groupInvitationsByDate([at(new Date(2026, 2, 12, 9))], NOW);

    expect(groups[0].key).toBe("thisWeek");
  });

  it("should group an item older than a week under earlier", () => {
    const groups = groupInvitationsByDate([at(new Date(2026, 1, 2, 9))], NOW);

    expect(groups[0].key).toBe("earlier");
  });

  it("should group an item without a date under earlier", () => {
    const groups = groupInvitationsByDate([{ createdAt: undefined }], NOW);

    expect(groups[0].key).toBe("earlier");
  });

  it("should group an item with an unparsable date under earlier", () => {
    const groups = groupInvitationsByDate([{ createdAt: "pas-une-date" }], NOW);

    expect(groups[0].key).toBe("earlier");
  });

  it("should return groups from the most recent to the oldest", () => {
    // Arrange
    const items = [
      at(new Date(2026, 0, 1, 9)),
      at(new Date(2026, 2, 13, 9)),
      at(new Date(2026, 2, 15, 9)),
      at(new Date(2026, 2, 14, 9)),
    ];

    // Act
    const groups = groupInvitationsByDate(items, NOW);

    // Assert
    expect(groups.map((group) => group.key)).toEqual([...NOTIF_GROUP_ORDER]);
  });

  it("should keep the incoming order inside a group", () => {
    // Arrange
    const first = { createdAt: new Date(2026, 2, 15, 8).toISOString(), token: "a" };
    const second = { createdAt: new Date(2026, 2, 15, 9).toISOString(), token: "b" };

    // Act
    const groups = groupInvitationsByDate([first, second], NOW);

    // Assert
    expect(groups[0].items).toEqual([first, second]);
  });

  it("should omit empty groups", () => {
    const groups = groupInvitationsByDate([at(new Date(2026, 2, 15, 9))], NOW);

    expect(groups).toHaveLength(1);
  });

  it("should return an empty array when there is nothing to group", () => {
    expect(groupInvitationsByDate([], NOW)).toEqual([]);
  });
});
