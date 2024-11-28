import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';
import styles from './index.module.css';
import { IconChevronLeft } from '@douyinfe/semi-icons';
import { Typography } from '@douyinfe/semi-ui';

gsap.registerPlugin(Observer);

const Carousel3D = () => {
  const { Title, Text } = Typography;

  const carouselRef = useRef(null);
  const imagesRef = useRef([]);
  const progress = useRef({ value: 0 });

  // 使用 state 来存储 radius
  const [radius, setRadius] = useState(window.innerHeight * 0.25 + 182.5);

  useEffect(() => {
    const updateRadius = () => {
      setRadius(window.innerHeight * 0.5 + 90);
    };

    // 初始化时设置 radius
    updateRadius();

    // 监听窗口变化
    window.addEventListener('resize', updateRadius);

    return () => {
      window.removeEventListener('resize', updateRadius);
    };
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    const images = imagesRef.current;

    Observer.create({
      target: carousel,
      type: 'wheel,pointer',
      onPress: () => {
        carousel.style.cursor = 'grabbing';
      },
      onRelease: () => {
        carousel.style.cursor = 'grab';
      },
      onChange: (self) => {
        gsap.killTweensOf(progress.current);
        const p = self.event.type === 'wheel' ? self.deltaY * -0.001 : self.deltaX * 0.01;
        gsap.to(progress.current, {
          duration: 0.5,
          ease: 'power1.out',
          value: `+=${p}`,
          overwrite: true,
        });
      },
    });

    const animate = () => {
      images.forEach((image, index) => {
        const theta = index / images.length - progress.current.value;
        const x = -Math.sin(theta * Math.PI * 2) * radius;
        const y = Math.cos(theta * Math.PI * 2) * radius;

        const normalizedY = y / radius;
        let opacity;

        if (normalizedY < 0) {
          opacity = 0;
        } else {
          opacity = normalizedY;
        }

        const scale = normalizedY > 0 ? 0.3 + normalizedY * 0.6 : 0.3;

        image.style.transform = `translate3d(${x}px, 0px, ${y}px) rotateX(20deg) rotateZ(15deg) scale(${scale})`;
        image.style.opacity = opacity;
        image.style.zIndex = Math.round(y);

        if (opacity === 0) {
          image.style.visibility = 'hidden';
        } else {
          image.style.visibility = 'visible';
        }
      });
    };

    gsap.ticker.add(animate);

    return () => {
      gsap.ticker.remove(animate);
    };
  }, [radius]); // radius 改变时重新计算

  return (
    <>
      <div className={styles.leftSide}>
        <Title style={{ color: 'white', marginLeft: '28px', marginTop: '24px', zIndex: '9' }}>
          目录 <br />
          Content
        </Title>
        <div className={styles.back}>
          <IconChevronLeft className={styles.leftButton} />
          <Text style={{ color: 'white', zIndex: '9' }}>返回</Text>
        </div>
      </div>
      <div className={styles.carouselContainer} ref={carouselRef}>
        {[...Array(10)].map((_, index) => (
          <div
            key={index}
            className={styles.carouselImage}
            ref={(el) => (imagesRef.current[index] = el)}
          >
            {index + 1}
          </div>
        ))}
        <img src={'/月球.svg'} alt="发光月球" className={styles.moonImage} />
      </div>
    </>
  );
};

export default Carousel3D;