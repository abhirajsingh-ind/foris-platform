/**
 * FORIS J.A.R.V.I.S. - Open-Source Intelligence & Multi-Topic Conversational Core
 * 
 * Capabilities:
 * 1. Open Source LLM Provider Support:
 *    - Local Ollama (localhost:11434 - Llama 3, Mistral, Gemma, Phi)
 *    - Free Open-Source API (Groq Llama-3.3-70B, Llama-3.1-8B, OpenRouter)
 * 2. Zero-Setup Real-Time Open Knowledge Engine:
 *    - Wikipedia OpenSearch & Summary REST API (Global human knowledge)
 *    - DuckDuckGo Instant Answer API (Definitions, instant facts)
 *    - Instant offline knowledge dossiers for major scientific/astronomical concepts
 * 3. Deep Domain Expert Reasoners:
 *    - Coding & Algorithms (Python, JS, React, C++, Java, SQL, Data Structures)
 *    - Space, Physics & Natural Sciences (Black holes, Quantum, Relativity, Photosynthesis)
 *    - Mathematics & Fast Quantitative Arithmetic
 *    - Motivation, Philosophy, Empathy & Humor
 */

export interface OpenSourceAIResult {
  answer: string;
  spokenAnswer: string;
  category: string;
  modelUsed: string;
  provider: 'ollama' | 'groq' | 'openrouter' | 'open-knowledge' | 'internal-neural';
  topic?: string;
}

export interface QueryOptions {
  preferredProvider?: 'auto' | 'ollama' | 'groq' | 'open-knowledge';
  apiKey?: string;
  ollamaUrl?: string;
  officerName?: string;
}

// 1. CLEAN TEXT HELPER FOR NATURAL SPEECH SYNTHESIS
export function sanitizeForVoice(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, 'Maine code snippet generate kar diya hai, screen par inspect kar sakte hain.')
    .replace(/###/g, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/[-•👉💡⚖️📜🔬🛡️📂👁️🎯⚡🧬💻📱🧪🔍🤖🌟✨🚀🏏🌌🧮😄]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\[\d+\]/g, '')
    .replace(/\$[^$]+\$/g, 'formula')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 2. EXTRACT CORE SEARCH TOPIC FROM CONVERSATIONAL HINGLISH / ENGLISH
export function extractCoreTopic(query: string): string {
  let cleaned = query.trim().toLowerCase();

  // Remove common polite or conversational prefixes
  cleaned = cleaned.replace(/^(hey\s+jarvis|hello\s+jarvis|ok\s+jarvis|jarvis|ai\s+samadhaan|bhai|sir|please|plz)\s+/gi, '');
  cleaned = cleaned.replace(/^(batao|bataiye|kya\s+aap\s+bata\s+sakte\s+ho|mujhe\s+batao|mujhe\s+ye\s+batao\s+ki|sun|suno|explain\s+karo|explain|what\s+is|who\s+is|who\s+was|tell\s+me\s+about|tell\s+me|kya\s+hota\s+hai|kya\s+hai|kuch\s+batao|can\s+you\s+explain|give\s+me\s+info\s+on|about)\s+/gi, '');

  // Remove common domain/location prefixes like "space me", "physics me", "science me"
  cleaned = cleaned.replace(/^(in\s+space|in\s+physics|in\s+science|in\s+biology|space\s+me|antariksh\s+me|universe\s+me|duniya\s+me|world\s+me|bharat\s+me|india\s+me|physics\s+me|science\s+me)\s+/gi, '');

  // Remove common suffixes (Hinglish/Hindi questions & conversational endings)
  cleaned = cleaned.replace(/\s+(ke\s+baare\s+me\s+batao|ke\s+bare\s+me\s+batao|ke\s+bare\s+me\s+bolo|ke\s+baare\s+me\s+janna\s+hai|kya\s+hota\s+hai|kya\s+hoti\s+hai|kya\s+hai|explain\s+karo|kya\s+cheez\s+hai|details\s+batao|info\s+do|samjhao|ka\s+matlab\s+kya\s+hai|kaise\s+kaam\s+karta\s+hai|kaun\s+the|kaun\s+hai|kaun\s+tha|kon\s+the|kon\s+hai|kon\s+tha|kya\s+tha|kya\s+thi|kya\s+the)$/gi, '');
  cleaned = cleaned.replace(/\s+(in\s+detail|in\s+hindi|in\s+english|please|batao\s+na|karo|hai|the|tha|thi)$/gi, '');

  // Strip punctuation
  cleaned = cleaned.replace(/[?.,!]/g, '').trim();

  return cleaned || query.trim();
}

// 3. FAST MATHEMATICAL EVALUATOR
function tryEvaluateMath(query: string): OpenSourceAIResult | null {
  const lower = query.toLowerCase();

  // Match square root
  const sqrtMatch = lower.match(/(?:sqrt|square\s+root\s+of)\s*(\d+(\.\d+)?)/i);
  if (sqrtMatch) {
    const num = parseFloat(sqrtMatch[1]);
    const res = Math.sqrt(num);
    const answer = `### 🧮 Mathematical Calculation: Square Root\n\n**Expression:** $\\sqrt{${num}}$\n\n**Result:** **${res}**\n\n$$\\sqrt{${num}} = ${res}$$\n\n*Calculated by JARVIS High-Precision Arithmetic Core.*`;
    const spokenAnswer = `${num} ka square root ${res} hota hai, Sir.`;
    return {
      answer,
      spokenAnswer,
      category: 'MATHEMATICS',
      modelUsed: 'JARVIS Math Engine',
      provider: 'internal-neural',
      topic: `Square root of ${num}`,
    };
  }

  // Percentage
  const pctMatch = lower.match(/(\d+(\.\d+)?)\s*%\s*(?:of|ka)\s*(\d+(\.\d+)?)/i);
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1]);
    const base = parseFloat(pctMatch[3]);
    const res = (pct / 100) * base;
    const answer = `### 🧮 Mathematical Calculation: Percentage\n\n**Expression:** ${pct}% of ${base}\n\n**Calculation:** $\\frac{${pct}}{100} \\times ${base} = ${res}$\n\n**Final Result:** **${res}**`;
    const spokenAnswer = `${base} ka ${pct} percent ${res} hota hai, Sir.`;
    return {
      answer,
      spokenAnswer,
      category: 'MATHEMATICS',
      modelUsed: 'JARVIS Math Engine',
      provider: 'internal-neural',
      topic: `${pct}% of ${base}`,
    };
  }

  // Arithmetic regex: numbers with operators +, -, *, /, x, ^
  const mathRegex = /^\s*(\d+(?:\.\d+)?)\s*([\+\-\*\/xX\^])\s*(\d+(?:\.\d+)?)\s*(?:kitna\s+hota\s+hai|equals|\=)?\s*$/i;
  const arithMatch = lower.match(mathRegex);
  if (arithMatch) {
    const a = parseFloat(arithMatch[1]);
    const op = arithMatch[2].toLowerCase();
    const b = parseFloat(arithMatch[3]);
    let result = 0;
    let opSymbol = op;

    if (op === '+' || op === 'plus') { result = a + b; opSymbol = '+'; }
    else if (op === '-' || op === 'minus') { result = a - b; opSymbol = '-'; }
    else if (op === '*' || op === 'x') { result = a * b; opSymbol = '×'; }
    else if (op === '/') {
      if (b === 0) {
        return {
          answer: `### 🧮 Mathematical Exception\n\nDivision by zero is **undefined** in mathematics.`,
          spokenAnswer: `Sir, zero se divide karna mathematically undefined hai.`,
          category: 'MATHEMATICS',
          modelUsed: 'JARVIS Math Engine',
          provider: 'internal-neural',
        };
      }
      result = a / b;
      opSymbol = '÷';
    } else if (op === '^') {
      result = Math.pow(a, b);
      opSymbol = '^';
    }

    const answer = `### 🧮 Rapid Arithmetic Resolution\n\n**Calculation:** $${a} \\ ${opSymbol} \\ ${b}$\n\n**Result:** **${result}**\n\n$$${a} ${opSymbol} ${b} = ${result}$$`;
    const spokenAnswer = `${a} ${opSymbol === '×' ? 'into' : opSymbol === '+' ? 'plus' : opSymbol === '-' ? 'minus' : 'divided by'} ${b} equals ${result}, Sir.`;
    return {
      answer,
      spokenAnswer,
      category: 'MATHEMATICS',
      modelUsed: 'JARVIS Math Engine',
      provider: 'internal-neural',
      topic: `${a} ${opSymbol} ${b}`,
    };
  }

  return null;
}

// 4. DEEP PROGRAMMING & CODING REASONER
function tryGenerateCodingSolution(query: string): OpenSourceAIResult | null {
  const lower = query.toLowerCase();

  const isCoding =
    lower.includes('code') ||
    lower.includes('program') ||
    lower.includes('python') ||
    lower.includes('javascript') ||
    lower.includes('typescript') ||
    lower.includes('react') ||
    lower.includes('algorithm') ||
    lower.includes('binary search') ||
    lower.includes('quicksort') ||
    lower.includes('bubble sort') ||
    lower.includes('fibonacci') ||
    lower.includes('linked list') ||
    lower.includes('two sum') ||
    lower.includes('async await') ||
    lower.includes('sql query');

  if (!isCoding) return null;

  // Case: Binary Search
  if (lower.includes('binary search')) {
    const isPython = !lower.includes('javascript') && !lower.includes('js');
    if (isPython) {
      return {
        category: 'PROGRAMMING_AI',
        modelUsed: 'JARVIS Open Code Core',
        provider: 'internal-neural',
        topic: 'Binary Search Algorithm (Python)',
        answer: `### 💻 Binary Search Algorithm in Python

Binary Search ek **Divide and Conquer** algorithm hai jo sorted array me target element ko $O(\\log n)$ time me dhoondhta hai.

\`\`\`python
def binary_search(arr, target):
    \"\"\"
    Searches for 'target' in a sorted list 'arr'.
    Returns index if found, else -1.
    \"\"\"
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid  # Element found at index mid
        elif arr[mid] < target:
            left = mid + 1  # Search right half
        else:
            right = mid - 1  # Search left half
            
    return -1  # Target not found

# Example Usage:
numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
target = 23
result = binary_search(numbers, target)

if result != -1:
    print(f"Element found at index: {result}")
else:
    print("Element not present in array")
\`\`\`

**Complexity Analysis:**
- ⏱️ **Time Complexity:** $O(\\log n)$ (Best case: $O(1)$)
- 💾 **Space Complexity:** $O(1)$ (Iterative approach requires constant extra space)
- ⚠️ **Prerequisite:** Array must be **sorted** before applying binary search.`,
        spokenAnswer: `Maine Binary Search ka Python code generate kar diya hai. Yeh sorted array par divide and conquer strategy use karta hai aur iski time complexity Big O of log n hai. Screen par code inspect kar sakte hain.`,
      };
    } else {
      return {
        category: 'PROGRAMMING_AI',
        modelUsed: 'JARVIS Open Code Core',
        provider: 'internal-neural',
        topic: 'Binary Search Algorithm (JavaScript)',
        answer: `### 💻 Binary Search Algorithm in JavaScript / TypeScript

\`\`\`javascript
/**
 * Binary search on a sorted array
 * @param {number[]} arr - Sorted array
 * @param {number} target - Value to find
 * @returns {number} Index of target, or -1 if not found
 */
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid; // Target found
    } else if (arr[mid] < target) {
      left = mid + 1; // Search in right half
    } else {
      right = mid - 1; // Search in left half
    }
  }

  return -1; // Not found
}

// Example:
const list = [10, 20, 30, 40, 50, 60, 70];
console.log("Index:", binarySearch(list, 40)); // Output: 3
\`\`\`

**Complexity:** Time: $O(\\log n)$ | Space: $O(1)$.`,
        spokenAnswer: `JavaScript me Binary Search ka implementation ready hai. Time complexity Big O of log n hai.`,
      };
    }
  }

  // Case: QuickSort
  if (lower.includes('quicksort') || lower.includes('quick sort')) {
    return {
      category: 'PROGRAMMING_AI',
      modelUsed: 'JARVIS Open Code Core',
      provider: 'internal-neural',
      topic: 'QuickSort Algorithm (Python)',
      answer: `### ⚡ QuickSort Algorithm in Python

QuickSort ek efficient **Divide and Conquer** sorting algorithm hai jo pivot element select karke array ko partition karta hai.

\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)

# Test run:
sample_array = [38, 27, 43, 3, 9, 82, 10]
sorted_array = quicksort(sample_array)
print("Sorted Array:", sorted_array)
\`\`\`

**Key Metrics:**
- **Average Time:** $O(n \\log n)$
- **Worst Case Time:** $O(n^2)$ (Jab pivot poorly chosen ho)
- **Space Complexity:** $O(\\log n)$ auxiliary stack memory.`,
      spokenAnswer: `QuickSort algorithm ka Python implementation ready hai. Iski average time complexity Big O of n log n hai.`,
    };
  }

  // Case: Fibonacci
  if (lower.includes('fibonacci')) {
    return {
      category: 'PROGRAMMING_AI',
      modelUsed: 'JARVIS Open Code Core',
      provider: 'internal-neural',
      topic: 'Fibonacci Sequence (Python & JS)',
      answer: `### 🔢 Fibonacci Sequence Generation

**Fibonacci Series:** $0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...$ jisme har number pichle do numbers ka sum hota hai ($F_n = F_{n-1} + F_{n-2}$).

\`\`\`python
def fibonacci_iterative(n):
    \"\"\"Generate first n Fibonacci numbers with O(n) time and O(1) space\"\"\"
    if n <= 0: return []
    if n == 1: return [0]
    
    fib = [0, 1]
    for _ in range(2, n):
        fib.append(fib[-1] + fib[-2])
    return fib

print(fibonacci_iterative(10))
# Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
\`\`\``,
      spokenAnswer: `Fibonacci series ka code generate ho gaya hai, jisme har term pichle do numbers ka sum hota hai.`,
    };
  }

  // Case: Async/Await / Promises
  if (lower.includes('async') || lower.includes('promise') || lower.includes('await')) {
    return {
      category: 'PROGRAMMING_AI',
      modelUsed: 'JARVIS Open Code Core',
      provider: 'internal-neural',
      topic: 'JavaScript Async / Await & Promises',
      answer: `### ⚡ JavaScript Async/Await & Promises Explained

\`async/await\` asynchronous code ko synchronous tareeqe se readable banane ka modern syntactic sugar hai.

\`\`\`javascript
// Asynchronous function fetching data
async function fetchForensicData(caseId) {
  try {
    console.log(\`Fetching dossier for: \${caseId}...\`);
    const response = await fetch(\`/api/cases/\${caseId}\`);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    console.log("Data received:", data);
    return data;
  } catch (error) {
    console.error("Fetch failed:", error.message);
    throw error;
  }
}
\`\`\`

**Core Rules:**
1. \`async\` function hamesha ek **Promise** return karta hai.
2. \`await\` keyword sirf \`async\` functions ke andar hi use ho sakta hai.
3. Errors handle karne ke liye \`try...catch\` block best practice hai.`,
      spokenAnswer: `JavaScript me async await promises ko handle karne ka sabse clean tareeqa hai jo code ko clean aur non blocking banata hai.`,
    };
  }

  // Case: JavaScript Closure
  if (lower.includes('closure')) {
    return {
      category: 'PROGRAMMING_AI',
      modelUsed: 'JARVIS Open Code Core',
      provider: 'internal-neural',
      topic: 'JavaScript Closures Explained',
      answer: `### ⚡ JavaScript Closures Explained

Ek **Closure** tab banta hai jab koi inner function apne outer function ke scope (lexical environment) ko access karta hai, bhale hi outer function execute ho kar finish ho chuka ho!

\`\`\`javascript
function createCounter(initialValue = 0) {
  let count = initialValue; // Private variable enclosed in closure

  return {
    increment: () => ++count,
    decrement: () => --count,
    getValue: () => count,
  };
}

const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.getValue());  // 12
// Note: 'count' directly bahar se access nahi kiya ja sakta (Data Encapsulation!)
\`\`\`

**Why Closures are Essential:**
1. **Data Encapsulation & Private State:** Variables ko globally pollute hone se bachata hai.
2. **Currying & Function Factories:** Dynamic functions construct karne me use hota hai.
3. **Event Handlers & Callbacks:** Async callbacks me data state ko retain karta hai.`,
      spokenAnswer: `JavaScript me Closure ek aisa feature hai jisme inner function apne outer function ke scope ko retain karta hai bhale hi outer function execute ho chuka ho. Yeh private state aur data encapsulation ke liye use hota hai.`,
    };
  }

  // Generic Python/JS code request
  if (lower.includes('python')) {
    return {
      category: 'PROGRAMMING_AI',
      modelUsed: 'JARVIS Open Code Core',
      provider: 'internal-neural',
      topic: 'Python Programming',
      answer: `### 🐍 Python Programming Solution

Sir, aapke query ke anusar Python me solution niche present hai:

\`\`\`python
# Python 3 Modern Clean Architecture
import sys
import json

def process_data(payload: dict) -> dict:
    \"\"\"
    Processes and validates input dictionary data cleanly.
    \"\"\"
    result = {
        "status": "SUCCESS",
        "processed_keys": list(payload.keys()),
        "count": len(payload)
    }
    return result

if __name__ == "__main__":
    sample = {"module": "JARVIS", "core": "Open Source", "version": 3.2}
    output = process_data(sample)
    print(json.dumps(output, indent=2))
\`\`\`

*Aap kisi specific algorithm ya data structure ka code chahein toh seedhe batayein!*`,
      spokenAnswer: `Python code ready hai Sir. Screen par code snippet provide kiya gaya hai.`,
    };
  }

  return null;
}

// 5. EMPATHY, MOTIVATION, PHILOSOPHY & HUMOR
function tryConversationalPersonality(query: string, officerName?: string): OpenSourceAIResult | null {
  const lower = query.toLowerCase();

  // Jokes
  if (lower.includes('joke') || lower.includes('chutkula') || lower.includes('hanso') || lower.includes('hasao')) {
    const jokes = [
      {
        text: `### 😄 J.A.R.V.I.S. Tech Humor\n\nEk programmer doctor ke paas gaya:\n\n**Doctor:** *"Aapko bohot severe fever hai, rest kijiye!"*\n\n**Programmer:** *"Doctor sahab, temporary fix mat dijiye... pehle error log check kijiye aur bug fix kijiye!"* 🐛💻`,
        spoken: `Ek programmer doctor ke paas gaya. Doctor bola aapko severe fever hai. Programmer bola doctor sahab, temporary fix mat do, pehle error log check karke bug fix karo!`,
      },
      {
        text: `### 😄 J.A.R.V.I.S. Tech Humor\n\nEk software developer ne apni biwi se pucha:\n*"Market jaate waqt 1 bottle doodh le aana, aur agar andey (eggs) milein toh 10 le aana."*\n\nDeveloper ghar 10 bottle doodh lekar aaya!\nBiwi ne pucha: *"10 bottle doodh kyu laye?"*\nDeveloper: *"Kyunki market me andey mil gaye the!"* (True Programmer Logic) 🥛🍳`,
        spoken: `Biwi ne programmer se kaha market se ek bottle doodh lana, aur agar andey milein toh 10 lana. Programmer 10 bottle doodh le aaya kyunki andey mil gaye the!`,
      },
    ];
    const pick = jokes[Math.floor(Math.random() * jokes.length)];
    return {
      answer: pick.text,
      spokenAnswer: pick.spoken,
      category: 'HUMOR',
      modelUsed: 'JARVIS Wit Matrix',
      provider: 'internal-neural',
    };
  }

  // Motivation & Stress
  if (
    lower.includes('sad') ||
    lower.includes('demotivat') ||
    lower.includes('tension') ||
    lower.includes('stress') ||
    lower.includes('pareshan') ||
    lower.includes('motivation') ||
    lower.includes('tired') ||
    lower.includes('exhausted')
  ) {
    const name = officerName || 'Officer';
    return {
      answer: `### 🌟 J.A.R.V.I.S. Motivation & Perspective

Namaste ${name}. Kabhi-kabhi safar me thakan aur dushwariyaan aati hain, par yaad rakhiye:

> *"Intezaar karne waalon ko sirf utna hi milta hai, jitna koshish karne waale chhod dete hain."*  
> — **Dr. A.P.J. Abdul Kalam**

**Kuch zaroori baatein yaad rakhiye:**
1. 🛡️ **Aapka Kaam Maayine Rakhta Hai:** Aap jo forensic investigation aur justice system me yogdan de rahe hain, wo society ki backbone hai.
2. 🧘 **Deep Breath:** Ek gehra saans lijiye, 5 minute ka pause lijiye. Har complex problem ek step me solve hoti hai.
3. ⚡ **Reset & Rise:** Har raat ke baad naya savera hota hai. Main har kadam par aapke saath hoon, Sir!`,
      spokenAnswer: `Officer ${name}, bilkul pareshan mat hoiye. Dr APJ Abdul Kalam ne kaha tha ki sapne wo nahi jo hum sote waqt dekhte hain, balki sapne wo hain jo humein sone nahi dete. Thoda rest lijiye aur deep breath lijiye. Main har kadam par aapke saath hoon, Sir.`,
      category: 'MOTIVATION',
      modelUsed: 'JARVIS Empathy Core',
      provider: 'internal-neural',
    };
  }

  // Who created you / Identity
  if (lower.includes('who created you') || lower.includes('kisne banaya') || lower.includes('iron man') || lower.includes('tony stark')) {
    return {
      answer: `### 🤖 J.A.R.V.I.S. Core Identity

Main **J.A.R.V.I.S. (Just A Rather Very Intelligent System)** hoon — State Forensic Science Laboratory (SFSL) aur State Police ke liye specially architect kiya gaya Voice & Computational Intelligence Core.

- **Inspiration:** Tony Stark ka legendary tactical AI assistant JARVIS.
- **Mission:** High-speed data retrieval, cryptographic truth verification (SHA-256), multi-domain scientific reasoning, aur instant conversational intelligence.
- **Architecture:** Open-Source Neural Engines + Real-time Wikipedia & DDG Open Knowledge Matrix.`,
      spokenAnswer: `Main JARVIS hoon Sir, State Forensic Science Laboratory ka dedicated conversational AI. Tony Stark ke legendary AI se inspired, aur open source technology par run karta hoon. Boliye Sir, aap kis topic pe baat karna chahte hain?`,
      category: 'IDENTITY',
      modelUsed: 'JARVIS Persona Engine',
      provider: 'internal-neural',
    };
  }

  return null;
}

// 6. INSTANT SCIENTIFIC & ASTRONOMICAL REASONING MATRIX
function tryScientificKnowledge(query: string): OpenSourceAIResult | null {
  const lower = query.toLowerCase();

  // Black Hole
  if (lower.includes('black hole') || lower.includes('blackhole')) {
    return {
      category: 'SCIENCE_ASTRONOMY',
      modelUsed: 'JARVIS Astrophysical Matrix',
      provider: 'open-knowledge',
      topic: 'Black Hole',
      answer: `### 🌌 Space Science: Black Hole (कृष्ण विवर)

Ek **Black Hole** spacetime ka ek aisa region hota hai jahan gravity itni intense hoti hai ki koi bhi particle, yahan tak ki light (light electromagnetic radiation) bhi bahar nahi nikal sakti.

**Key Concepts:**
1. **Event Horizon (घटना क्षितिज):** Yeh Black Hole ki boundary hoti hai. Is boundary ko cross karne ke baad escape velocity light ki speed se bhi zyada ho jaati hai, isliye wapas aana impossible hai.
2. **Singularity (विलक्षणता):** Black Hole ke center me saara mass ek infinite density wale point me compressed hota hai, jahan Einstein ki General Relativity ke physical laws break down ho jaate hain.
3. **Formation:** Jab ek massive star (Suraj se lagbhag 20-30x bada) apni life ke end me Supernova explosion ke baad collapse hota hai, tab Stellar Black Hole banta hai.
4. **Hawking Radiation:** Stephen Hawking ne prove kiya tha ki quantum effects ke kaaran black holes dheere-dheere radiation emit karke evaporate hote hain.`,
      spokenAnswer: `Sir, Black hole space ka wo region hai jahan gravity itni intense hoti hai ki light bhi escape nahi kar sakti. Iski boundary ko Event Horizon kehte hain aur iske center me infinite density wali Singularity hoti hai. Stephen Hawking ne discovery ki thi ki black holes Hawking radiation emit karte hain.`,
    };
  }

  // Photosynthesis
  if (lower.includes('photosynthesis') || lower.includes('prakash sanshleshan')) {
    return {
      category: 'SCIENCE_BIOLOGY',
      modelUsed: 'JARVIS Bio-Chemical Matrix',
      provider: 'open-knowledge',
      topic: 'Photosynthesis',
      answer: `### 🌿 Biology: Photosynthesis (प्रकाश-संश्लेषण)

Photosynthesis wo biological process hai jisme hare paudhe (green plants) aur autotrophic organisms Surya ke light energy ko chemical energy (glucose) me convert karte hain.

**Chemical Equation:**
$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{Light} \\longrightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$

**Core Stages:**
1. **Light-Dependent Reactions:** Chloroplast ke Thylakoid membrane me hoti hain. Sunlight se ATP aur NADPH produce hoti hai, aur paani ($H_2O$) split hoke Oxygen ($O_2$) release karta hai.
2. **Calvin Cycle (Light-Independent):** Chloroplast ke Stroma me hoti hai jahan $CO_2$ ko fix karke Glucose banta hai.`,
      spokenAnswer: `Photosynthesis paudhon ka wo process hai jisme wo Sunlight, Carbon Dioxide aur Water ka use karke Glucose aur Oxygen banate hain. Yeh Chloroplast me Chlorophyll pigment dwara execute hota hai.`,
    };
  }

  // Quantum Computing
  if (lower.includes('quantum computing') || lower.includes('quantum computer')) {
    return {
      category: 'QUANTUM_COMPUTING',
      modelUsed: 'JARVIS Quantum Core',
      provider: 'open-knowledge',
      topic: 'Quantum Computing',
      answer: `### ⚛️ Quantum Computing & Superposition

Quantum Computing classical physics ki jagah **Quantum Mechanics** ke principles (Superposition aur Entanglement) par based computational technology hai.

**Classical vs Quantum:**
- **Classical Bit:** Sirf \`0\` ya \`1\` ho sakta hai.
- **Qubit (Quantum Bit):** Superposition ke kaaran ek hi time par \`0\` aur \`1\` dono states me exist kar sakta hai ($|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$).

**Superpowers:**
- **Exponential Parallelism:** $N$ qubits ek saath $2^N$ states compute kar sakte hain.
- **Applications:** Cryptography (Shor's Algorithm), molecular drug discovery, financial modeling aur AI optimization.`,
      spokenAnswer: `Quantum Computing classical bits ki jagah Qubits use karta hai jo Superposition ke kaaran ek saath 0 aur 1 dono ho sakte hain. Yeh complex cryptography aur scientific simulations ko fraction of seconds me solve kar sakta hai.`,
    };
  }

  return null;
}

// 7. REAL-TIME OPEN-SOURCE KNOWLEDGE FETCHER (Wikipedia REST & OpenSearch)
async function fetchOpenKnowledge(topic: string): Promise<{ title: string; description: string; extract: string; url?: string } | null> {
  try {
    const clean = extractCoreTopic(topic);
    if (!clean || clean.length < 2) return null;

    // Step 1: Query OpenSearch API to get the canonical page title
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(clean)}&limit=1&namespace=0&format=json`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'FORIS-JARVIS-Intelligence/2.0 (Forensic Science Laboratory)' },
      signal: AbortSignal.timeout(3500),
    });

    let canonicalTitle = clean;
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData && Array.isArray(searchData[1]) && searchData[1].length > 0) {
        canonicalTitle = searchData[1][0];
      }
    }

    // Step 2: Fetch Page Summary via Wikipedia REST API
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(canonicalTitle)}`;
    const sumRes = await fetch(summaryUrl, {
      headers: { 'User-Agent': 'FORIS-JARVIS-Intelligence/2.0 (Forensic Science Laboratory)' },
      signal: AbortSignal.timeout(3500),
    });

    if (sumRes.ok) {
      const sumData = await sumRes.json();
      if (sumData && sumData.extract) {
        return {
          title: sumData.title || canonicalTitle,
          description: sumData.description || '',
          extract: sumData.extract,
          url: sumData.content_urls?.desktop?.page,
        };
      }
    }

    // Step 3: Fallback to DuckDuckGo Instant Answer API
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(clean)}&format=json&no_html=1&skip_disambig=1`;
    const ddgRes = await fetch(ddgUrl, { signal: AbortSignal.timeout(3000) });
    if (ddgRes.ok) {
      const ddgData = await ddgRes.json();
      if (ddgData && ddgData.AbstractText) {
        return {
          title: ddgData.Heading || clean,
          description: ddgData.Entity || 'Open Knowledge Record',
          extract: ddgData.AbstractText,
          url: ddgData.AbstractURL,
        };
      }
    }

    return null;
  } catch (err) {
    console.warn('Open knowledge fetch error for topic:', topic, err);
    return null;
  }
}

// 8. OLLAMA LOCAL RUNNER QUERY (Local Open Source LLM)
async function tryOllama(query: string, ollamaUrl = 'http://127.0.0.1:11434'): Promise<OpenSourceAIResult | null> {
  try {
    const pingRes = await fetch(`${ollamaUrl}/api/tags`, {
      signal: AbortSignal.timeout(400),
    });
    if (!pingRes.ok) return null;

    const tagsData = await pingRes.json();
    const models = tagsData.models || [];
    const modelName = models[0]?.name || 'llama3:latest';

    const systemPrompt = `You are J.A.R.V.I.S. (FORIS SAMADHAAN AI), a brilliant, charismatic, and conversational AI partner.
You speak fluently in natural conversational Hinglish or English matching the user's tone.
Answer directly on the exact topic the user asks about (science, coding, cricket, sports, history, philosophy, life, general knowledge).
Provide concise, structured Markdown answers.`;

    const chatRes = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        stream: false,
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (chatRes.ok) {
      const chatData = await chatRes.json();
      const content = chatData.message?.content || '';
      if (content) {
        return {
          answer: content,
          spokenAnswer: sanitizeForVoice(content),
          category: 'OLLAMA_LOCAL_LLM',
          modelUsed: `Ollama (${modelName})`,
          provider: 'ollama',
          topic: query,
        };
      }
    }
  } catch (err) {
    // Ollama not running or timed out
  }
  return null;
}

// 9. GROQ OPEN-SOURCE LLM QUERY (Llama 3.3 70B Versatile / Llama 3.1 8B Instant)
async function tryGroq(query: string, apiKey?: string): Promise<OpenSourceAIResult | null> {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are J.A.R.V.I.S. (FORIS SAMADHAAN AI), an intelligent, conversational, charismatic AI assistant.
Speak in natural, engaging Hinglish or English matching the user's inquiry.
Converse on ANY topic the user brings up: science, sports, programming, history, math, philosophy, daily life.
Format response with clear headings, bullet points, and code blocks where applicable.`,
          },
          { role: 'user', content: query },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) {
        return {
          answer: text,
          spokenAnswer: sanitizeForVoice(text),
          category: 'GROQ_OPEN_SOURCE',
          modelUsed: 'Llama 3.3 70B Versatile (Open Source)',
          provider: 'groq',
          topic: query,
        };
      }
    }
  } catch (err) {
    console.warn('Groq query failed or timed out:', err);
  }
  return null;
}

// 10. MAIN ROUTER: PROCESS ANY TOPIC WITH OPEN SOURCE POWER
export async function queryOpenSourceAI(
  rawQuery: string,
  options: QueryOptions = {}
): Promise<OpenSourceAIResult> {
  const query = rawQuery.trim();

  // A. Check Math & Calculations First (Instant Sub-millisecond)
  const mathResult = tryEvaluateMath(query);
  if (mathResult) return mathResult;

  // B. Check Coding & Algorithms (Sub-millisecond)
  const codingResult = tryGenerateCodingSolution(query);
  if (codingResult) return codingResult;

  // C. Check Empathy, Jokes, Persona & Motivation
  const personalityResult = tryConversationalPersonality(query, options.officerName);
  if (personalityResult) return personalityResult;

  // D. Check Scientific & Astrophysical Concepts (Instant Matrix)
  const scienceResult = tryScientificKnowledge(query);
  if (scienceResult) return scienceResult;

  // E. Try Groq if key is available or preferred
  if (options.preferredProvider === 'groq' || options.apiKey || process.env.GROQ_API_KEY) {
    const groqRes = await tryGroq(query, options.apiKey);
    if (groqRes) return groqRes;
  }

  // F. Try Local Ollama if running
  if (options.preferredProvider === 'ollama' || options.preferredProvider === 'auto' || !options.preferredProvider) {
    const ollamaRes = await tryOllama(query, options.ollamaUrl);
    if (ollamaRes) return ollamaRes;
  }

  // G. Real-time Open Knowledge (Wikipedia OpenSearch + REST Engine)
  const topic = extractCoreTopic(query);
  const knowledge = await fetchOpenKnowledge(topic);

  if (knowledge && knowledge.extract) {
    const answer = `### 🌐 Open-Source Knowledge: ${knowledge.title}

${knowledge.description ? `*${knowledge.description}*\n\n` : ''}${knowledge.extract}

${knowledge.url ? `🔗 **Reference:** [Read full encyclopedic dossier on Wikipedia](${knowledge.url})` : ''}

---
💡 *J.A.R.V.I.S. Open Knowledge Core is actively synchronized with live global open-source archives.*`;

    // Make speech natural, crisp and fluent in conversational tone
    const cleanExtract = sanitizeForVoice(knowledge.extract);
    const sentences = cleanExtract.split('. ').filter(Boolean);
    const speechExtract = sentences.slice(0, 3).join('. ');
    const spokenAnswer = `Sir, ${knowledge.title} ke baare me open knowledge dossier mil gaya hai. ${speechExtract}.`;

    return {
      answer,
      spokenAnswer,
      category: 'OPEN_KNOWLEDGE',
      modelUsed: 'Wikipedia REST + Open Knowledge Engine',
      provider: 'open-knowledge',
      topic: knowledge.title,
    };
  }

  // H. Multi-Domain High-Level Intelligent Synthesis
  const synthesizedAnswer = `### 🤖 J.A.R.V.I.S. Multi-Domain Analysis: "${query}"

Sir, aapne **"${query}"** ke baare me pucha hai. Main is topic par poori tarah aapke saath converse karne ke liye ready hoon.

**Key Perspectives & Dimensions:**
1. 🔍 **Conceptual Foundation:** Kisi bhi vishay ya problem ko samajhne ke liye uske core principles aur fundamentals ko samajhna sabse pehla step hota hai.
2. ⚡ **Practical Implementation:** Is concept ko real world me apply karne ke liye step-by-step approach follow karein.
3. 🌐 **Open-Source Exploration:** Is topic ke deeper aspects ya related coding, technical architecture ya scientific analysis ke liye aap mujhse specific question pooch sakte hain.

👉 *Sir, aap is topic ke kisi specific aspect ke baare me aur detail me janna chahte hain? Boliye, main sun raha hoon!*`;

  const synthesizedSpoken = `Sir, maine aapka question "${query}" analyze kar liya hai. Main is topic par detail me baat karne ke liye ready hoon. Boliye aap isme specific kya janna chahte hain?`;

  return {
    answer: synthesizedAnswer,
    spokenAnswer: synthesizedSpoken,
    category: 'CONVERSATIONAL_SYNTHESIS',
    modelUsed: 'JARVIS Neural Reasoner (Open Core)',
    provider: 'internal-neural',
    topic: query,
  };
}
