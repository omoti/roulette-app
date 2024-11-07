import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const colorGroups = {
    red: ['#FF4444', '#FF6666', '#FF3333'],     // 赤系
    orange: ['#FF9900', '#FF8833', '#FF7744'],  // オレンジ系
    yellow: ['#FFCC00', '#FFB900', '#FFA500'],  // 黄系
    green: ['#33CC33', '#44BB44', '#55AA55'],   // 緑系
    blue: ['#3366FF', '#4477FF', '#5588FF'],    // 青系
    purple: ['#9933FF', '#8844FF', '#7755FF'],  // 紫系
    pink: ['#FF66CC', '#FF77BB', '#FF88AA'],    // ピンク系
    teal: ['#00CCCC', '#00BBBB', '#00AAAA']     // ターコイズ系
  };

  const sampleNames = ['名前１', '名前２', '名前３', '名前４', '名前５'];
  
  const getDistributedColors = (count) => {
    const groupKeys = Object.keys(colorGroups);
    let selectedColors = [];
    let lastGroupIndex = -1;

    for (let i = 0; i < count; i++) {
      let availableGroups = groupKeys.filter((_, index) => index !== lastGroupIndex);
      
      const groupIndex = Math.floor(Math.random() * availableGroups.length);
      const selectedGroup = availableGroups[groupIndex];
      
      const groupColors = colorGroups[selectedGroup];
      const colorIndex = Math.floor(Math.random() * groupColors.length);
      
      selectedColors.push(groupColors[colorIndex]);
      
      lastGroupIndex = groupKeys.indexOf(selectedGroup);
    }

    return selectedColors;
  };

  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState(() => {
    const distributedColors = getDistributedColors(sampleNames.length);
    return sampleNames.map((name, index) => ({
      name,
      color: distributedColors[index]
    }));
  });
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setMemberInput(input);
    
    const names = input
      .split('\n')
      .filter(name => name.trim())
      .map(name => name.trim());

    if (names.length > 0) {
      const distributedColors = getDistributedColors(names.length);
      const newMembers = names.map((name, index) => ({
        name,
        color: distributedColors[index]
      }));
      setMembers(newMembers);
    } else {
      const distributedColors = getDistributedColors(sampleNames.length);
      setMembers(sampleNames.map((name, index) => ({
        name,
        color: distributedColors[index]
      })));
    }
  };

  const spinRoulette = () => {
    setIsSpinning(true);
    setSelectedMember(null);
    const extraSpins = 5;
    const randomDegrees = Math.random() * 360;
    const totalRotation = (360 * extraSpins) + randomDegrees;
    
    setRotation(rotation + totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const finalRotation = (rotation + totalRotation) % 360;
      const segmentSize = 360 / members.length;
      const selectedIndex = Math.floor(
        (360 - (finalRotation % 360)) / segmentSize
      );
      setSelectedMember(members[selectedIndex % members.length]);
    }, 3000);
  };

  const getSegmentPath = (index, total) => {
    const angle = (360 / total);
    const startAngle = angle * index;
    const endAngle = startAngle + angle;
    const radius = 180; // 円の半径
    const centerX = 200; // 中心のX座標
    const centerY = 200; // 中心のY座標

    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    return `M${centerX},${centerY} L${x1},${y1} A${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`;
  };

  return (
    <div className="app">
      <h1>ファシリテータールーレット</h1>
      <div className="content-wrapper">
        <div className="main-container">
          <div className="roulette-section">
            <div className="roulette-container">
              <svg 
                className="wheel" 
                viewBox="0 0 400 400"
                ref={wheelRef}
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 3s cubic-bezier(0.2, 0.8, 0.3, 1)' : 'none'
                }}
              >
                {members.map((member, index) => {
                  const rotation = (360 / members.length) * index;
                  const isSelected = selectedMember && member.name === selectedMember.name;
                  return (
                    <g key={index}>
                      <path
                        d={getSegmentPath(index, members.length)}
                        fill={member.color}
                        stroke="#fff"
                        strokeWidth="2"
                        className={isSelected ? 'highlight' : ''}
                      />
                      {member.name.split('').map((char, charIndex) => (
                        <text
                          key={charIndex}
                          x="200"
                          y="200"
                          transform={`rotate(${rotation + (360 / members.length / 2)} 200 200)`}
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          dy={-120 + (charIndex * 25)}
                          fill="#000"
                          className="segment-text"
                        >
                          {char}
                        </text>
                      ))}
                    </g>
                  );
                })}
              </svg>
              <div className="wheel-center" />
              <div className="wheel-arrow" />
            </div>
            <button 
              onClick={spinRoulette} 
              disabled={isSpinning}
            >
              {isSpinning ? '回転中...' : 'スタート'}
            </button>
          </div>
          <div className="input-section">
            <h2>メンバーリスト</h2>
            <textarea
              value={memberInput}
              onChange={handleInputChange}
              placeholder={`名前１\n名前２\n名前３\n名前４\n名前５`}
              disabled={isSpinning}
            />
            <div className="member-count">
              現在の人数: {members.length}人
            </div>
          </div>
        </div>
        {selectedMember && !isSpinning && (
          <div className="result-display">
            <div className="selected-member">
              {selectedMember.name}さん、お願いします！
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
