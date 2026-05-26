const assert = require('assert');

/**
 * 계산기 핵심 계산 함수 시뮬레이션
 * @param {string} currentDisplay - 사용자가 입력한 수식
 * @returns {string} - 연산 결과 또는 'Error'
 */
function calculateMock(currentDisplay) {
    try {
        let expr = currentDisplay.trim();

        // 1. 미완성 음수 괄호 '(-' 로 끝나는 경우 정리
        if (expr.endsWith('(-')) {
            expr = expr.slice(0, -2).trim();
        }

        // 2. 괄호가 온전하게 안 닫혀있는지 체크 및 자동 보정
        const openParens = (expr.match(/\(/g) || []).length;
        const closeParens = (expr.match(/\)/g) || []).length;
        if (openParens > closeParens) {
            expr += ')'.repeat(openParens - closeParens);
        }

        // 3. 화면 표시 연산자를 계산용 연산자로 변환 (× -> *, ÷ -> /)
        let targetEval = expr.replace(/×/g, '*').replace(/÷/g, '/');

        // 4. 똑똑한 퍼센트(%) 처리 연산
        // 패턴 A: 숫자 + 비율% -> 숫자 + (숫자 * 비율/100)  [사칙연산 중 +,- 에만 비례적용]
        // 패턴 B: 숫자 * 비율% -> 숫자 * (비율/100)        [곱셈/나눗셈은 단순비율 적용]
        const percentPattern = /([0-9.]+)\s*([\+\-*/])\s*([0-9.]+)\%/g;
        if (percentPattern.test(targetEval)) {
            targetEval = targetEval.replace(percentPattern, (match, base, op, percent) => {
                if (op === '+' || op === '-') {
                    return `${base} ${op} (${base} * ${percent} / 100)`;
                } else {
                    return `${base} ${op} (${percent} / 100)`;
                }
            });
        }
        // 패턴 C: 기타 단독 퍼센트 처리 (예: 50% -> 50/100)
        targetEval = targetEval.replace(/([0-9.]+)\%/g, '($1/100)');

        // 5. 보안 필터링
        const safeFilter = /^[0-9+\-*/().\s]*$/;
        if (!safeFilter.test(targetEval)) {
            throw new Error("Invalid Format");
        }

        // 6. 계산 실행
        const calcFunc = new Function(`return (${targetEval})`);
        const result = calcFunc();

        // 계산 불능 오류 처리
        if (result === undefined || isNaN(result) || !isFinite(result)) {
            throw new Error("Math Error");
        }

        // 7. 자바스크립트 부동소수점 오차 보정
        return Number(result.toFixed(12)).toString();

    } catch (e) {
        return 'Error';
    }
}

// ==================== 테스트 케이스 실행 ====================
const testCases = [
    { name: "1. 기본 사칙연산 검증 (120 + 340)", input: "120 + 340", expected: "460" },
    { name: "2. 연산 우선순위 검증 (2 + 3 × 4)", input: "2 + 3 × 4", expected: "14" },
    { name: "3. 부동소수점 정밀도 오차 보정 검증 (0.1 + 0.2)", input: "0.1 + 0.2", expected: "0.3" },
    { name: "4. 지능형 괄호 자동 복구 검증 ((10 + 20)", input: "(10 + 20", expected: "30" },
    { name: "5. 스마트 백분율 합산 검증 (100 + 10%)", input: "100 + 10%", expected: "110" },
    { name: "6. 스마트 백분율 곱셈 검증 (100 × 5%)", input: "100 × 5%", expected: "5" },
    { name: "7. 나눗셈 예외 상황 검증 (5 ÷ 0)", input: "5 ÷ 0", expected: "Error" },
    { name: "8. 음수 괄호 변환 계산 검증 (10 + (-5))", input: "10 + (-5)", expected: "5" }
];

console.log("=== 나만의 계산기 엔진 자가 진단 테스트 시작 ===");
let passedCount = 0;

testCases.forEach((tc) => {
    const result = calculateMock(tc.input);
    try {
        assert.strictEqual(result, tc.expected);
        console.log(`✅ [성공] ${tc.name} -> 결과: ${result}`);
        passedCount++;
    } catch (err) {
        console.error(`❌ [실패] ${tc.name} -> 예상값: ${tc.expected}, 실제결과: ${result}`);
    }
});

console.log("\n=============================================");
console.log(`진단 완료: 총 ${testCases.length}개 항목 중 ${passedCount}개 통과 완료!`);
console.log("=============================================");
