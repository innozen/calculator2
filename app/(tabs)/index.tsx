import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

const buttons: string[][] = [
  ['AC', '+/-', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

const isOperatorChar = (char: string) => ['÷', '×', '-', '+'].includes(char);

function safeEval(expr: string): string {
  try {
    const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');
    // eslint-disable-next-line no-eval
    const result = eval(sanitized);
    return result.toString();
  } catch {
    return 'Error';
  }
}

export default function HomeScreen() {
  const [current, setCurrent] = useState<string>('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [expression, setExpression] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<string>('');

  const handleTap = (type: string, value?: string) => {
    if (type === 'number' && value) {
      if (current.length > 10) return;
      
      if (lastResult !== '') {
        setCurrent(value);
        setExpression(value);
        setLastResult('');
        setOperator(null);
        setPrevious(null);
      } else {
        setCurrent(current === '0' ? value : current + value);
        setExpression(expression === '0' ? value : expression + value);
      }
    }
    if (type === 'operator' && value) {
      const lastChar = expression.slice(-1);
      if (isOperatorChar(lastChar)) {
        setExpression(expression.slice(0, -1) + value);
      } else {
        setExpression(expression + value);
      }
      setOperator(value);
      setPrevious(current);
      setCurrent('0');
      setLastResult('');
    }
    if (type === 'equal') {
      if (!expression) return;
      const result = safeEval(expression);
      setCurrent(result);
      setExpression(result);
      setLastResult(result);
      setHistory(prevHistory => {
        const newHistory = [expression + '=' + result, ...prevHistory];
        return newHistory.slice(0, 2);
      });
      setOperator(null);
      setPrevious(null);
    }
    if (type === 'clear') {
      // 현재 입력 중인 내용만 삭제, 이전 결과값은 유지
      setCurrent('0');
      setOperator(null);
      setPrevious(null);
      setExpression('');
      setLastResult('');
      // history는 유지 (이전 결과값 보존)
    }
    if (type === 'posneg') {
      if (lastResult !== '') {
        const negated = (parseFloat(lastResult) * -1).toString();
        setCurrent(negated);
        setExpression(negated);
        setLastResult(negated);
      } else {
        setCurrent((parseFloat(current) * -1).toString());
        setExpression(expression.slice(0, -current.length) + (parseFloat(current) * -1).toString());
      }
    }
    if (type === 'percent') {
      if (lastResult !== '') {
        const percented = (parseFloat(lastResult) / 100).toString();
        setCurrent(percented);
        setExpression(percented);
        setLastResult(percented);
      } else {
        setCurrent((parseFloat(current) / 100).toString());
        setExpression(expression.slice(0, -current.length) + (parseFloat(current) / 100).toString());
      }
    }
    if (type === 'dot') {
      if (!current.includes('.')) {
        if (lastResult !== '') {
          setCurrent('0.');
          setExpression('0.');
          setLastResult('');
        } else {
          setCurrent(current + '.');
          setExpression(expression + '.');
        }
      }
    }
  };

  const renderButton = (content: string, index: number, rowIndex: number) => {
    const isOperator = ['÷', '×', '-', '+'].includes(content);
    const isEqual = content === '=';
    const isZero = content === '0';
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.button,
          isOperator && styles.operatorButton,
          isEqual && styles.equalButton,
          isZero && styles.zeroButton,
        ]}
        onPress={() => {
          if (content === 'AC') handleTap('clear');
          else if (content === '+/-') handleTap('posneg');
          else if (content === '%') handleTap('percent');
          else if (['÷', '×', '-', '+'].includes(content)) handleTap('operator', content);
          else if (content === '=') handleTap('equal');
          else if (content === '.') handleTap('dot');
          else handleTap('number', content);
        }}
      >
        <Text style={[
          styles.buttonText,
          (isOperator || isEqual) && styles.operatorText
        ]}>
          {content}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.display}>
        <Text style={styles.historyText} numberOfLines={1}>{history[1] || ''}</Text>
        <Text style={styles.historyText} numberOfLines={1}>{history[0] || ''}</Text>
        <Text style={styles.displayText} numberOfLines={1}>{expression || current}</Text>
      </View>
      <View style={styles.buttonContainer}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.buttonRow}>
            {row.map((content, index) => renderButton(content, index, rowIndex))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#7dd6f7', justifyContent: 'center' },
  display: { flex: 2, backgroundColor: '#000', justifyContent: 'flex-end', alignItems: 'flex-end', padding: 24 },
  historyText: { color: '#aaa', fontSize: 24, minHeight: 32, alignSelf: 'flex-end' },
  displayText: { color: '#fff', fontSize: 64, fontWeight: 'bold', minHeight: 64, alignSelf: 'flex-end' },
  buttonContainer: { flex: 5, backgroundColor: '#f7f7f7', padding: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  button: { flex: 1, backgroundColor: '#fff', margin: 6, borderRadius: 32, justifyContent: 'center', alignItems: 'center', height: 64, elevation: 2 },
  zeroButton: { flex: 2 },
  operatorButton: { backgroundColor: '#7dd6f7' },
  equalButton: { backgroundColor: '#222' },
  buttonText: { fontSize: 28, color: '#222', fontWeight: 'bold' },
  operatorText: { color: '#fff' },
});
