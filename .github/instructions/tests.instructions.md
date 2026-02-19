---
applyTo: "**/*{test,spec}*.*"
---

# Test Guidelines

- Schreibe Tests so klein wie möglich: Arrange–Act–Assert.
- Teste Verhalten, nicht Implementierungsdetails.
- Pro Test: genau eine Aussage über das Verhalten.
- Nutze sprechende Testnamen: "should ... when ...".
- Wenn etwas schwer testbar ist: schlage eine kleine Umstrukturierung vor (Dependency Injection / pure function), aber nur wenn nötig.
