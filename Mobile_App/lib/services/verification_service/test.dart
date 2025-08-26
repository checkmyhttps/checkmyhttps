String jsonToResponse(dynamic json) {
  // Fonction récursive pour parcourir les valeurs JSON
  String parseValues(dynamic value, String key) {
    if (key == "signature") {
      // Ignore les valeurs avec les labels spécifiés
      return "";
    } else if (value is Map) {
      // Concatène les valeurs des sous-objets, sauf pour les labels spécifiés
      return value.entries
          .map((entry) => parseValues(entry.value, entry.key))
          .join();
    } else if (value is Iterable) {
      // Concatène les éléments des listes
      return value.map((item) => parseValues(item, "")).join();
    } else {
      // Convertit les valeurs "true" en "1" et "false" en "0"
      if (value.toString() == "true") {
        return "1";
      } else if (value.toString() == "false") {
        return "0";
      } else {
        // Retourne la valeur simple sous forme de chaîne
        return value.toString();
      }
    }
  }

  // Vérifie si l'objet JSON est un Map et appelle la fonction récursive
  if (json is Map) {
    return json.entries
        .map((entry) => parseValues(entry.value, entry.key))
        .join();
  } else {
    // Si json n'est pas un Map, retourne directement sa représentation sous forme de chaîne
    return json.toString();
  }
}
