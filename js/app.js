/***********************************************************************
         * 1. GLOBAL STATE & CONFIGURATION
         ***********************************************************************/
        const state = {
            profile: 'university',       // 'university' | 'home'
            mode: 'entrance',            // reception only
            expression: 'happy',         // 'happy' | 'listening' | 'thinking' | 'wink' | 'guardian' | 'sleep'
            explodeAmount: 0,            // 0.0 to 1.0
            targetExplode: 0,
            xrayMode: false,
            showLabels: true,
            autoRotate: false,
            showRadar: true,
            voiceMuted: false,
            mouseX: 0,                   // Normalized -1 to 1 for eye gaze tracking
            mouseY: 0,
            blinkTimer: 0,
            isBlinking: false,
            smartLightsOn: true,
            smartAcTemp: 24,
            pomodoroSeconds: 1500,
            selectedPartKey: 'full'
        };

        // Detailed Part Metadata for 3D Click/Callout Inspector
        const PART_SPECS = {
            full: {
                tag: 'COMPLETE SYSTEM • 1.67M TALL',
                title: 'CYNO BOT 1.67m Autonomous Assistant',
                desc: 'A full-scale humanoid assistant featuring 6 modular sub-assemblies, Apple Mac mini M1 core brain, 10" kiosk touchscreen, dual articulated legs, and balanced anti-tip chassis.',
                spec1: 'Height: 1.67m (Life-Size)',
                spec2: 'Architecture: 6-Part Modular'
            },
            head: {
                tag: 'MODULE 01 • HEAD SECTION',
                title: 'Head Shell, Animated Eyes & Sensor Array',
                desc: 'Houses the top HD USB camera, ultrasonic distance sensor (1.5m–3m detection), animated cyan OLED/LCD eye display, and dual side speaker/microphone pods with status LED rings.',
                spec1: 'Sensors: Cam + Ultrasonic',
                spec2: 'Audio: Mic Array + Stereo'
            },
            torso: {
                tag: 'MODULE 02 • CHEST & TORSO',
                title: 'Armored Torso & 10" Chest Touchscreen Kiosk',
                desc: 'Shaped white PVC + 3D-printed shell with a tilted 7"–10" capacitive touchscreen for campus maps, schedules and QR codes.',
                spec1: 'Display: 10" Touch Kiosk',
                spec2: 'Shell: PVC + 3D Printed'
            },
            brain: {
                tag: 'INTERNAL CORE • LAYER 2 & 3',
                title: 'Apple Mac mini (M1) + ESP32 Controller',
                desc: 'The internal brain: 8-core CPU/GPU & 16-core Neural Engine running Whisper STT, Ollama local LLM, OpenCV, and FastAPI at only 7W idle, paired with ESP32 microcontrollers and dual cooling fans.',
                spec1: 'Brain: Apple Mac mini M1',
                spec2: 'Control: ESP32 + Dual Fans'
            },
            leftArm: {
                tag: 'MODULE 03 • LEFT ARM ASSEMBLY',
                title: 'Modular Left Arm & Stationary Gripper',
                desc: 'Detachable shoulder actuator joint, upper/lower white armored shells with glowing cyan trim, and zero-pinch stationary articulated hand for safe public interaction.',
                spec1: 'Safety: Zero Pinch Points',
                spec2: 'Mount: Quick-Lock Joint'
            },
            rightArm: {
                tag: 'MODULE 04 • RIGHT ARM ASSEMBLY',
                title: 'Modular Right Arm & Stationary Gripper',
                desc: 'Detachable right arm module engineered with lightweight internal steel framing and shaped PVC outer armor panels for effortless transport and maintenance.',
                spec1: 'Weight: Ultra-Light PVC',
                spec2: 'Finish: Matte White/Black'
            },
            legs: {
                tag: 'MODULE 05 & 06 • LOWER BODY & LEGS',
                title: 'Pelvis Joiner, Dual Legs & Heavy Weighted Base',
                desc: 'High-strength steel internal skeleton running through the thighs, knee structures, and shins down into a heavy flat weighted steel base plate with hidden stabilizers.',
                spec1: 'Height: 1.67m Humanoid',
                spec2: 'Base: Weighted Anti-Tip'
            }
        };

        /***********************************************************************
         * 2. DYNAMIC 2D CANVAS TEXTURES FOR 3D FACE & CHEST SCREENS
         ***********************************************************************/
        // A. Face Screen Canvas (512 x 320)
        const faceCanvas = document.createElement('canvas');
        faceCanvas.width = 512;
        faceCanvas.height = 320;
        const faceCtx = faceCanvas.getContext('2d');
        let faceTexture = null;

        // B. Chest Touchscreen Canvas (512 x 512)
        const chestCanvas = document.createElement('canvas');
        chestCanvas.width = 512;
        chestCanvas.height = 512;
        const chestCtx = chestCanvas.getContext('2d');
        let chestTexture = null;
        const _cynoWolfLogoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAABVySURBVHhe7d35s3RFfcdx/wSQVUBRFpFFDIIgqBADVFzAaIxAFEwKgqIhoAhB1BIiIYJsMYKACIFAUEABZQ3IKkqCYRFRka1QUAQ0PokLiZp8Ut9rz61zP/fsy9xZ3q+q54dnppe5Z/r0nNOn+9vPeQ4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1CPpNEmH+usYP0kXSXqHvw4MQtIakv5bv7Ovv4/xkXRB+h5u8feAQcRJnxrdCJ3ACpB0YeY7+F9Jm3kaoHeSrs00vBE6gTGyk3/kSE8H9ErSCyT9yltewn3oGBSc/OEuTwv0StJh3uoy4jL0zZ4H/ZF0ph90s53nAXoj6eve4sxvJe3h+dCdpJP8YOc4wfMBvYhBJkn/4y0uR9wi7O750Z6kY/wgF/iO5wV6Iel93tpK/KekHb0MNCfp/X5wK+zsZQCdSbrOW1qFH0ra2MtBfZL+zA9qDcd6OUAnktaStMpbWg2P0gm0I2k/P5g13etlAZ1IOsBbWQMPSXqhl4liOZOtmoinMVt5mUBrmSmnbUUnsKGXi+U6nvwjB3m5QGuSHvEW1sKDdALlYjKVH7SWrvSygVYk7SDpN97CWvpezCb0OtDryR9+Kum5XgfQmKSPeOvKeFrSP/uLFegEjKS3+0GqEAOyT/qL5rVeD9CYpMu9ZWWsSmku8zcqRCewgdc1j2LmpKT/8wNUYR9JR/iL5gNeF9CYpKe8ZWXck0l3n79Z4VuS1lla23yRtKukZ/3AVDgx5a26arja6wMakbRLeqxU5J8yaX+v5lThrDskrb601vkgafsWcytuzOTfumJs5umlNQINSdrfW5XZ39K3uZz9craMeSBpoxr38C6umNaycmK2ZZFfR6ecTQ80Iukcb1UZcWWwbN55TEX1hDV8zsuZVZJeJOlhPwAVIgTbsqW+0Xl6QrO35wFqk3S7t6iMWPCT+6hJ0pc8cQ3nejmzJuZBpElRTe3jZYUaS4TP8DxALXFvLukX3qIyHvE8I5KeJ+l+z1DDZ7ysWZGiKcVkqKZO9bJG0tOAMl/xPEAtkl6VAnwU+bznyWoQP8DNXCeQTv549NnUTV5WVnqKUDZI+4znAWqpsRR14XFUGUl7eaaaZqYT6HDyx63Cel6ek/Qzz5gRV3BLBg6BWiQd7q3JvMHz5JF0smesaeo7AUnrtzz548rp1V5eHknf9MwZcXVAiDY0V2OE+fWep0g8v/bMNZ3tZU0LSatJutv/oJoO9vKKSDrfM5t3eh6gUgwgeUvKiNlrW3ieIuky+PteSE2neXnTQNL1/ofUtDi5qg5Jn/UCzCc8D1AqjeL/3FtSxuOep4qk3SoGrMp82MubZC3WRox8z8uqIukQL8Rc73mAUpKen2aSFXnM89Qh6TgvqIG/9PImUY1f5CLROe7k5VWR9DovyFzleYBSaZ552a9165l7HcYDwkTfz8bApX/gBlqt3ovBWC/IfNXzAKVigM9bkfmU56mr5Tz4rLd5mXWlK5vCf56+iY4n/794eXWlJw1ljwIf8DxAKUnv8lZkzvQ8TUh6ixfYQExOekumrDUlbRIdQ5q7EP/eExOVYkls+hcbmkZYs5hTX/bvB+kKZZQvpjR/KFPunvFsPuq0v6fLyf9M1wApcUvmhWbEXID1PQ9QSNJ7vRWZwz1PUx3mB4QYn7gyBiPTmoQ4ecclBkejzpskXZQ6ii5y5/k3kY5DkZhT0KmDwZxJv6BlWl+GZ0m60wueM2f5MWmj4gogOsdOtzeYMxFW2luR2dPztCFpc0m/9MLnxP1+PNqSdLMXnkEHgGZq7AO4q+dpq8Z4wyyKW4gt/Vi0JekLXkEGHQCakXSUtyKzi+fpQtLFXsGMO9CPQRcVE4/oANBMRSjw8Puep4s0b75sIGuWXOR/f1dpMLIIHQCakfRRb0Wm1w4gpLXts64wiEoXEU3JK8qgA0AzNcYAeu8AQkS/8YpmSARL3dH/5j7QAaBXNZ4ClHYAKZxYq3Dfkr7tlc2Io/1vraPOySvpPK8sgw4AzdSYB1A6CJimEl/or9eR9hdoulnGpGu1SUc6Fl/w152kS7zCDDoANBMr77wVmT/0PFmS3p3SvcLfqyLpgJaxBCfZF9tMx03TmR/0152kS73CjJg1yUxA1Cfpz70VmdKZgPGYK6Wr/cuXngRcaPXMktjE403+dxeJgCtp3CC2ZlvN389KHUyRWHjV6nYMcyri0XkrMgd5niwbzHuVv+/SFuRtQmZPo1P8788TS65T+rgaKr2Ejz0arY6sOzw9UCptYFF2GV66HFjSbZm01/r7WemJQ1nwkVl0q6SX+rEYiVmCmZDs8T1s6GmyJD1h5Wdd4+mBUimGX9meAKVx+nJ2FMqNdFNx6TrrYjrwX/gxCTmj+qUrBisWA13p6YFKFY/jLvD0I5LWTmvcs5aMBaSdcb9jaebVkiCgkjbN2fW38JYrxUL4L0ufdYjnASpVrHN/1NOPpAbsOwTH/zdN78fin7IGO49iWfTW6fh83N+MDVf9OI9IeqMnNvt6HqCSpH/wlpTxhKcfkbRxQTzBsyV92l/EogjrFZuxfNffkHSDH+eReLLgiTNiPsVmngeoJGl/b00ZMTC18IvlJG3ridHZLX6cRwquGEYiHBiPANFcjWizuZOBaswiRHOFu/xK+kdPnHGvpwdqSZuDlMXae7fnCZI+6AnRWdmYy7974ozelx5jjlTE7Dvf0wdJh3lC9OJFOcc6IiKX7eBU+PQAqCTpDG9RGfd5+hDbeHlC9GK3nGNdtitQPEqsnIUJFIqdeLxVZfxK0gaWfndJP/WE6MWyJwEVcRtWeXqgkbQgpWya7mJ04NQYy6YPo7sl23xVBANlSzB0VzHIdFJKc7y/gcF8PfPdlK0BOGbJFwm0EfvLe8vKiOnCf+8vYnBfjc1E/UXzGv8ugcYi/FfO1F5Mth/49wi0Jukhb2GYaLmPaIFWKtYFYPIs7p4MdJaW72I6POPfH9BZ2g4bk680WhPQSkXkWUyOw/y7AzrJhPnG5Isowo1DkAO5JG1DBJ+pQxxA9EPS3d66MBUIBYZuYkDJWxWmxk8krePfKVBLLD/1FoWpU7onA1AootB4a8JUIigImpF0urciTK3YgKR0azFgUY19AZuIoCGxTRiLiZq5rGLL76Yu9e8ZyNXzqH8EE9k77XN/FtGCSq2SdG50wOl7KNuZqY03+ncNLBHbSHmr6cE3MuWvm/YbuCqNUs+7X0q6WdL7s5fpkvbzhD24f/GLBlzaEHSoCT+75tS3TtomLIJbzJvYCv3ovEi/QdL3PUNPPuJ1AQskXe6tpUex3dVqXueIpNfH7jeeaQbFhqi5OwKPSDrFM/Uo9nko3JYcc0rSn3pLGcBnvF4naS9J3/SMMyD2/av89ZW0c8G+in1ajCkIRKNbT9LT3koGsrPXnydFGP6hZ55C8Qju5LqP4eLk9AIGwopB/I6kL3vrGNA5Xn+RNEYQg2P3eiFT4MeSPiZpI/+7ikh6pRcyoBh83MQ/A+bMQKPNZb7tn6EOSX8s6UYvbALdJ+lgSWv531AldRjjdI1/BsyRMV/6j8TGIa33q49Q1xWbYayUGMB8m3/eJsZ8JTayn38OzIkVPJE6nSghzVa82AteAREmLXeb9KZSII9xix+Adf2zYMZJ2sNbwhhd7J+nrbRnwde8gjGIWXqL26J1JelAr2CMLvHPgxkn6TFvBQ3FpXzbX6x4Fr2lf6Yuxnz/fKukNfwzdNFh34X4Hh7xF1tYtvMwZlTHGP9Pxn6AknZJA15t9b5OPXbD8UoG0uuW25IO9QoaiM405nDsmRYPxeh+Gw/658IMkrRty5V5ca8bgUEXfvnSwp6uel2nLuk8r2AAj3m9XUjaqocFUk9kyttE0hEx798T1XD00k+HmSPpDv/WS8QkljjRl/ziSdrHE3bwrmzZXcQUWy98AJ/1etuS9DJJP/IKWroqp/w3Sbpa0m88cYFnJb3Yy8GMkHSAf+MFYjvw2Hl22ey1eG2AVXznS9rc62oqGm9qxEPqpcNKE5xienCfcj9buso4seYCoys8P2ZExT1yNMa4hN7F82VJusEz9iTuZc+WtIPX2YSkB7zgnrXuqCRtKumotCBoCLGSc2uvNyv9CFQ9NXmr58OUi4Uo/i0nsfDmcEkbeB4n6a8880DuknRqm+frA0+maTyLMQVCOSxm3XUYoGviHv8MeSTtJOmTBU9yHvX0mGIxH13SLzJfcHzpcdn9Ok9bJA0eZssYlydS8JA4iUp/3YKkv/YCerTsPtulYx0RkOJqJtb8r4QT/XMVkbRmGjvxfR//ztNiSkm6Ln2p8fz6PZLW9jRVJmhBToxux/3stv4ZQ9xCeIYefdjrC5I2TB1UrORbiU4yzxv8c1ZJ06yj43omlfFaT4MpJOmjkrbz1+saOEBFF8t+6eIeveVjzjrel1NfLFIaKopSF7GUek3/vHWksG1xu8c6gXkn6U+8ZU2QmAX3PPu8axXc13YVncrLs3Wl+voMoNq3y/3zArWlR36xrn2SfSDnc8djzL5FlJ4l8ftifoQnmkC9TrbCHEkj15Nu2ah3w8lOdUUHsCSARkwK8kQTKPZl6HXdBeZAmqgyLV5pn/1fPUEPYjbdxpk61hhgIs9Q7s4eH6CUpB3HEJiyT2fa5x+iA4jxhsVbgDFNO+7Tp7LHCCjUcZXfSnjKPv8QHcCSWwBJt3uCKdBb/ALMqPQceBq9I/M3DNoBSNrG35wSjxP9B4V6XuU3bouz9AbsABbGAFI8hGl12ZIvHQhpNttoBtg0ihl4G6a/ZYjY+tEBvCCVX2dV3SQ7xL9/zLmBfjXHbSGgRTwa9Dd6EuvrY7rstIsBzZd5G8CcknSCt5ApFbPy1h5oJmCIiEjn+ItT6j5vB5hDKZbcUHPnxy0u04+UtMrf6EksqpqF7cpGPuntAXMk5tEP+Gu5UmLqcgQXQT1v9naBOSHpem8NmFhDhTqLH4B1vG1gxkk61ltCj+JS/Lv+IlqLSUcRy2Eot3j7wAxLuwINfd8f9+IrtfXYLIk4jrHEuU2Y7yY+7u0EMyptazW0T6S6uBJoLx7XxWPHCNsVIdqHtp63FcygFKjyCv/2e3Zrqmu7BnHpsdTh6RjG/IMhxcSpnb2dYMalcFZt96Sr8qNMPREkE82cnTl+EdJtCHFVceRig8B8Shtr9j3KHFNzF3eZiSizngCFlkzSGSjwyBdjn4JsPZhjETVmgJj6S+L6p/DeKBd7B2xkx63PpcexK/Re2fKBRZLeWbGDUBMHWNkx8WioW45Zsezk7CnyUIzDnNb3tuaYQSnc1emSfuutqKFzcsp+9ZRFGxqn03OOV0Rn6jqIGjESifGPZiT9QccNQRaeBLjYYMMTQvf7cQodB1AjIOgHvUygEUnHpGfSTf2HlzXCeMAScWxf6scolOzpWCU2AG29GQywhKTtW4TbjgGtJaG0RyStX2NlXSzqidDkQ89aHEr8fd/yF3O814/PiKTPe+IK8TQndwszoDNJx3uLq/BHXsZImuBSdnLfKek4f3GKxDbgMSW6zKV+XLIabnISHfQrvAygV/F4T9LD3voKHOX5s9IchCKxkWlsYT2t4mnKZnEr5G8kC/P8/ZiMSHpugy3FT/b8wGBS4/ySt8IcV3heV7DSLSYSrS7pAn9jivws/X3n+Rvpyqd0e/a003HVE4CnJb3V8wJjIemIisd6D3seFzPSJP3E8i10HHGJbK9PkxjDiIU8O/sbo8VSZSTt65lMxHNgNh9WVrolKBrQW/gl9zwuJyT5wiYWU94BxOj+aC+BbCThr/jfnyc2Ps3kcWd4emDFSHphQYShX/vefUUknZvyLF41THkHEH/7wuO9zFqI6CgXwotXKbjFijIJ643JVHC/u7+nKxKrCONJQ+b/094BbJX+jpekAb3S+/6snLgNcWx28HTARJF0qDXc8zxNkTTfILsH3zR3ADGVejH+fpNY/JI2sKnYd0na3NMBEykWtWQWsdzs79c15R1ADI5u439THakjHM2RuNzfByZe2kQzwnTHL9na/n4dPXQAMfh2k6SrG/yL2Ye31ZzFVyZO4Jf731RHmgMRal89ARNH0hZpRtxicJAmOnYAB3l5TaXVeF2WR7eamZc2ID3JXwfmSocOYEksgi5iV+AOnUCrQbuIneCvAXOnZQdwoJfTVbqSKZrrUKbWI1AAOVp0AOd7GX2JR3heWQ2tbgEANO8A4he6cHFNH2LRjVdaovVTAADNO4DBfv1H0rqFumIhz8JEIAAtNOwAbvP8fYt7eq+0RCwG2szLAFBTil9fV5xwW3gZfYqrDK+0RHyel3gZAGqSdJGfVRVO8TL6ElNxU6DNun5ed+EPgBySjvazqsKqofa7l3SJV1bhGS8DQAPxTN/PqhrO8nK6SiHSm1qICASgpQ5x8V/jZXUh6R6voIYHvBwADUja3c+qmmIPvNyQ5E1J+pwXXtOynZEANCTpKT+zanq0aycg6VQvtIG3e3kAGop7ej+zGogrgVaBM1tsypEVocDX9DIBNBSRdPzsaihiAtRel592LbrSC2noQ14ugJY6XgWEiE60h5frYupuh6W/I/d5uQA6kvSQn2kNxdz8sq3K4uSPwJtdRBh0Zv8BfUsLcbr+OsdMvp1zyn6xpCc9cQt7e9kAeiJpS0mP+1nX0LJdeWps4lnHvl4ugJ6lX+tH/OyrKfbS29DLDCkgaFuc/MC4SFo3wmX7WVjhfknbellZkj5t8firxC0Fz/uBlSDpWD8jc/ybpIM9bxFJW0s6O10tlKnsUAAMTNJuku5NJ2VsxxVbcEVc/9iPbydPX1eEF0vx+WNOQIQ2j/X9ozoGW3YMoAVJu6YQ3uv7e32Q9PzU2Wzv7wEAAAAAgPFJi3hK9wVI227HOEEEGjlB0vHxDD/NLYh7/NIVfJHGXwMwASR9TNKzkq7N2fE3/n0tvR+j+C7WCcQofzz6K8ofuwzHHIHtvG4AE0DSN/zM7tlxXieACSLpbj9rezL4zkMAOkoTeGLiTp9u8HoATKg0qFc1lbeuG718ABMu1v2nacFd3OzlApgSaXpwROlp4xYvD8CUkbSjpB/72V3hGi8HwJRKG3vWfTrQ+9ZiAFZYejpwp5/t5m89H4AZIWn1NCMwz994egAzSNLtdvIf7WkAzDBJ16WT/wh/D8AcqLNbEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMmf8HiE5sAlZOElMAAAAASUVORK5CYII=';
        const _cynoWolfLogoImg = new Image();
        _cynoWolfLogoImg.src = _cynoWolfLogoDataUri;

        function renderFaceScreenTexture(time) {
            const ctx = faceCtx;
            const w = faceCanvas.width;
            const h = faceCanvas.height;

            // Deep glossy black screen background
            ctx.fillStyle = '#030712';
            ctx.fillRect(0, 0, w, h);

            // Subtle scanline grid
            ctx.strokeStyle = 'rgba(0, 210, 255, 0.04)';
            ctx.lineWidth = 1;
            for (let y = 0; y < h; y += 8) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }

            // Eye gaze offset from mouse cursor
            const gazeX = studioMouse.x * 22;
            const gazeY = studioMouse.y * 14;

            const leftEyeX = 165 + gazeX;
            const rightEyeX = 347 + gazeX;
            const eyeY = 135 + gazeY;

            // Determine color based on expression
            const mainColor = state.expression === 'guardian' ? '#ff3b5c' :
                              state.expression === 'sleep' ? '#475569' : '#00d2ff';

            ctx.save();
            ctx.shadowColor = mainColor;
            ctx.shadowBlur = state.expression === 'sleep' ? 6 : 24;
            ctx.strokeStyle = mainColor;
            ctx.fillStyle = mainColor;

            // Blink factor
            const scaleY = state.isBlinking ? 0.12 : 1.0;

            if (state.expression === 'sleep') {
                // Closed sleeping eyes (U U)
                ctx.lineWidth = 10;
                ctx.lineCap = 'round';
                [leftEyeX, rightEyeX].forEach(ex => {
                    ctx.beginPath();
                    ctx.arc(ex, eyeY, 36, 0.15 * Math.PI, 0.85 * Math.PI, false);
                    ctx.stroke();
                });
                // Floating Zzz
                ctx.font = 'bold 24px "JetBrains Mono", monospace';
                ctx.fillText('Zzz... 7W Idle', 175, 255);
            } else if (state.expression === 'guardian') {
                // Hazard Alert Eyes
                ctx.lineWidth = 12;
                [leftEyeX, rightEyeX].forEach(ex => {
                    ctx.beginPath();
                    ctx.arc(ex, eyeY, 44 + Math.sin(time * 10) * 4, 0, Math.PI * 2);
                    ctx.stroke();
                });
                // Warning Triangle Mouth
                ctx.font = 'bold 34px "Orbitron", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('⚠ SOS ALERT ⚠', w / 2, 260);
            } else {
                // Glowing Ring Eyes matching CYNO BOT photo!
                const radius = state.expression === 'listening' ? 46 + Math.sin(time * 6) * 3 : 44;

                // Left Eye
                ctx.save();
                ctx.translate(leftEyeX, eyeY);
                ctx.scale(1, scaleY);
                if (state.expression === 'wink') {
                    ctx.lineWidth = 12;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.arc(0, 8, 38, 1.15 * Math.PI, 1.85 * Math.PI, false);
                    ctx.stroke();
                } else {
                    ctx.lineWidth = 13;
                    ctx.beginPath();
                    ctx.arc(0, 0, radius, 0, Math.PI * 2);
                    ctx.stroke();
                    // Inner bright cyan halo
                    ctx.lineWidth = 4;
                    ctx.strokeStyle = '#e0f2fe';
                    ctx.beginPath();
                    ctx.arc(0, 0, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();

                // Right Eye
                ctx.save();
                ctx.translate(rightEyeX, eyeY);
                ctx.scale(1, scaleY);
                ctx.lineWidth = 13;
                ctx.strokeStyle = mainColor;
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#e0f2fe';
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                // Mouth Expression
                if (state.expression === 'listening') {
                    // Animated voice waveform mouth
                    ctx.lineWidth = 6;
                    ctx.lineCap = 'round';
                    for (let i = -4; i <= 4; i++) {
                        const barH = 8 + Math.abs(Math.sin(time * 10 + i)) * 22;
                        ctx.beginPath();
                        ctx.moveTo(w / 2 + i * 16, 240 - barH / 2);
                        ctx.lineTo(w / 2 + i * 16, 240 + barH / 2);
                        ctx.stroke();
                    }
                } else if (state.expression === 'thinking') {
                    // Neural pulsing dots
                    for (let i = -1; i <= 1; i++) {
                        const r = 8 + Math.sin(time * 8 + i * 1.5) * 4;
                        ctx.beginPath();
                        ctx.arc(w / 2 + i * 32, 240, Math.max(3, r), 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else {
                    // Classic CYNO BOT friendly curved cyan smile (◡)
                    ctx.lineWidth = 9;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.arc(w / 2 + gazeX * 0.4, 212 + gazeY * 0.3, 38, 0.22 * Math.PI, 0.78 * Math.PI, false);
                    ctx.stroke();
                }
            }
            ctx.restore();

            if (faceTexture) faceTexture.needsUpdate = true;
        }

        function renderChestScreenTexture(time) {
            const ctx = chestCtx;
            const w = chestCanvas.width;
            const h = chestCanvas.height;

            // Dark screen background
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#040b1a');
            grad.addColorStop(1, '#02050d');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Top HUD bar on chest display
            ctx.fillStyle = 'rgba(0, 210, 255, 0.14)';
            ctx.fillRect(20, 20, w - 40, 44);
            ctx.strokeStyle = 'rgba(0, 210, 255, 0.45)';
            ctx.lineWidth = 2;
            ctx.strokeRect(20, 20, w - 40, 44);

            ctx.fillStyle = '#00d2ff';
            ctx.font = 'bold 18px "JetBrains Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`CYNO-OS // ${state.profile.toUpperCase()}`, 36, 48);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#38bdf8';
            ctx.fillText('M1 ONLINE', w - 36, 48);

            ctx.save();
            ctx.textAlign = 'center';

            if (state.mode === 'ai') {
                // Iconic glowing "AI" emblem from the CYNO BOT photo!
                ctx.shadowColor = '#00d2ff';
                ctx.shadowBlur = 30;
                ctx.fillStyle = '#00d2ff';
                ctx.font = 'bold 135px "Inter", sans-serif';
                if (_cynoWolfLogoImg && _cynoWolfLogoImg.complete) { ctx.drawImage(_cynoWolfLogoImg, w / 2 - 90, 125, 180, 180); } else { ctx.fillText('CYNOCOR', w / 2, 245); }

                // Pulsing ring around AI
                ctx.strokeStyle = 'rgba(0, 210, 255, 0.45)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(w / 2, 220, 115 + Math.sin(time * 3) * 6, 0, Math.PI * 2);
                ctx.stroke();

                ctx.shadowBlur = 0;
                ctx.fillStyle = '#e2e8f0';
                ctx.font = 'bold 22px "Orbitron", sans-serif';
                ctx.fillText('MAC MINI M1 NEURAL AI', w / 2, 395);
                ctx.fillStyle = '#38bdf8';
                ctx.font = '17px "JetBrains Mono", monospace';
                ctx.fillText('English Voice Ready', w / 2, 430);
            } else if (state.mode === 'entrance') {
                // University Entrance Assistant Map & QR Screen
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 28px "Orbitron", sans-serif';
                ctx.fillText('WELCOME TO CAMPUS!', w / 2, 110);
                ctx.fillStyle = '#00d2ff';
                ctx.font = '18px "Inter", sans-serif';
                ctx.fillText('INFORMATION & ASSISTANCE', w / 2, 140);

                // Mini Campus Map Blueprint Box
                ctx.strokeStyle = '#00d2ff';
                ctx.fillStyle = 'rgba(0, 210, 255, 0.08)';
                ctx.lineWidth = 2;
                ctx.fillRect(40, 165, 260, 210);
                ctx.strokeRect(40, 165, 260, 210);

                // Animated Route Line
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 5;
                ctx.setLineDash([10, 6]);
                ctx.beginPath();
                ctx.moveTo(75, 340);
                ctx.lineTo(170, 340);
                ctx.lineTo(170, 215);
                ctx.lineTo(255, 215);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = '#10b981';
                ctx.font = 'bold 15px "JetBrains Mono", monospace';
                ctx.fillText('2ND FLOOR: COMPUTING', 170, 195);

                // Simulated QR Code Box on Right
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(325, 175, 145, 145);
                ctx.fillStyle = '#050811';
                for (let r = 0; r < 7; r++) {
                    for (let c = 0; c < 7; c++) {
                        if ((r + c) % 2 === 0 || (r === 0 || r === 6 || c === 0 || c === 6)) {
                            ctx.fillRect(337 + c * 17, 187 + r * 17, 13, 13);
                        }
                    }
                }
                ctx.fillStyle = '#38bdf8';
                ctx.font = '14px "JetBrains Mono", monospace';
                ctx.fillText('SCAN CAMPUS MAP', 397, 348);

                // Bottom Touch Buttons
                ['[MAP]', '[EVENTS]', '[ASK AI]'].forEach((lbl, idx) => {
                    const bx = 50 + idx * 145;
                    ctx.fillStyle = 'rgba(0, 210, 255, 0.2)';
                    ctx.fillRect(bx, 405, 125, 52);
                    ctx.strokeStyle = '#00d2ff';
                    ctx.strokeRect(bx, 405, 125, 52);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 16px "JetBrains Mono", monospace';
                    ctx.fillText(lbl, bx + 62, 437);
                });
            }

            ctx.restore();
            if (chestTexture) chestTexture.needsUpdate = true;
        }

        /***********************************************************************
         * 3. THREE.JS 3D SCENE & PROCEDURAL CYNO BOT BUILDER
         ***********************************************************************/
        let scene, camera, renderer, robotRoot;
        const modularGroups = {};
        const shellMaterials = [];
        let coolingFan1, coolingFan2, radarRing1, radarRing2;

        // Studio Mouse & Head Look-at Tracking State
        const studioMouse = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0
        };

        // Camera Orbit State (Default straight-on view at human eye-level)
        const camState = {
            theta: 0.0,
            phi: 1.50,
            radius: 4.2,
            targetY: 1.35,
            targetTheta: 0.0,
            targetPhi: 1.50,
            targetRadius: 4.2,
            targetLookY: 1.35
        };

        // 3D Callout definitions with local positions
        const CALLOUT_DEFS = [
            { key: 'head', label: '1. Head & Eye Display', sub: 'Cam + Ultrasonic + Mic', pos: new THREE.Vector3(0.55, 2.75, 0.2) },
            { key: 'torso', label: '2. Chest Touchscreen', sub: '10" Kiosk + White PVC Shell', pos: new THREE.Vector3(-0.68, 1.95, 0.3) },
            { key: 'brain', label: 'Apple Mac mini M1', sub: 'Core Brain + ESP32 + Fans', pos: new THREE.Vector3(0.65, 2.12, -0.1) },
            { key: 'leftArm', label: '3. Modular Left Arm', sub: 'Stationary Safe Gripper', pos: new THREE.Vector3(0.85, 1.65, 0.1) },
            { key: 'legs', label: '4. Legs & Weighted Base', sub: 'Steel Frame + Anti-Tip Base', pos: new THREE.Vector3(-0.62, 0.55, 0.25) }
        ];
        const calloutElements = [];

        function initThreeJS() {
            const container = document.getElementById('robot-canvas-container');
            const width = container.clientWidth || 600;
            const height = container.clientHeight || 600;

            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x050811, 0.065);

            camera = new THREE.PerspectiveCamera(40, width / height, 0.05, 40);

            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                logarithmicDepthBuffer: true,
                powerPreference: 'high-performance'
            });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            container.appendChild(renderer.domElement);

            // Studio Lighting Setup
            const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.75);
            scene.add(ambientLight);

            const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
            keyLight.position.set(4, 7, 5);
            keyLight.castShadow = true;
            keyLight.shadow.bias = -0.0005;
            keyLight.shadow.normalBias = 0.02;
            scene.add(keyLight);

            const cyanRimLight = new THREE.PointLight(0x00d2ff, 1.6, 10);
            cyanRimLight.position.set(-3.5, 3.0, -2.5);
            scene.add(cyanRimLight);

            const blueFillLight = new THREE.PointLight(0x0066ff, 1.1, 10);
            blueFillLight.position.set(3.5, 1.5, 2.5);
            scene.add(blueFillLight);

            // Create Dynamic Canvas Textures
            faceTexture = new THREE.CanvasTexture(faceCanvas);
            chestTexture = new THREE.CanvasTexture(chestCanvas);

            // Build CYNO BOT 3D Model
            buildCynoBotModel();

            // Build Floor Greeting Zone Radar (1.5m - 3m)
            buildFloorEnvironment();

            // Create Interactive HTML Callout Pins
            createCalloutDOMElements();

            // Setup Mouse & Touch Camera Controls + Raycasting
            setupViewportInteractions(container);

            // Handle Responsive Resize
            window.addEventListener('resize', onWindowResize);
        }

        function buildCynoBotModel() { buildHeroRobotModel(scene); robotRoot = heroRobotRoot; robotRoot.scale.set(1.22, 1.22, 1.22); return;
            robotRoot = new THREE.Group();
            scene.add(robotRoot);

            // Shared High-Tech Materials matching CYNO BOT photo
            const whiteArmorMat = new THREE.MeshStandardMaterial({
                color: 0xf8fafc,
                roughness: 0.25,
                metalness: 0.12
            });
            shellMaterials.push(whiteArmorMat);

            const darkJointMat = new THREE.MeshStandardMaterial({
                color: 0x111827,
                roughness: 0.45,
                metalness: 0.55
            });

            const matteBlackMat = new THREE.MeshStandardMaterial({
                color: 0x090d16,
                roughness: 0.6,
                metalness: 0.3
            });

            const cyanGlowMat = new THREE.MeshBasicMaterial({
                color: 0x00d2ff,
                polygonOffset: true,
                polygonOffsetFactor: -2,
                polygonOffsetUnits: -2,
                depthWrite: false
            });

            const blueTrimMat = new THREE.MeshStandardMaterial({
                color: 0x0284c7,
                emissive: 0x0077ff,
                emissiveIntensity: 0.45,
                roughness: 0.2,
                polygonOffset: true,
                polygonOffsetFactor: -1,
                polygonOffsetUnits: -1
            });

            const silverAlumMat = new THREE.MeshStandardMaterial({
                color: 0xe2e8f0,
                roughness: 0.2,
                metalness: 0.85
            });

            const steelFrameMat = new THREE.MeshStandardMaterial({
                color: 0x334155,
                roughness: 0.35,
                metalness: 0.8
            });

            // Helper to tag meshes for raycast part selection
            function tagGroup(group, partKey) {
                group.traverse(child => {
                    if (child.isMesh) child.userData.partKey = partKey;
                });
            }

            // =================================================================
            // 1. BASE PLATE & INTERNAL STEEL SKELETON
            // =================================================================
            const baseGroup = new THREE.Group();
            robotRoot.add(baseGroup);
            modularGroups.base = baseGroup;

            // Heavy flat matte-black base plate
            const basePlate = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.08, 0.82), matteBlackMat);
            basePlate.position.y = 0.04;
            baseGroup.add(basePlate);

            // Base beveled top plate with cyan underglow strip (non-coplanar offsets)
            const baseTop = new THREE.Mesh(new THREE.BoxGeometry(1.10, 0.04, 0.74), darkJointMat);
            baseTop.position.y = 0.105;
            baseGroup.add(baseTop);

            const baseGlowStrip = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.008, 0.78), cyanGlowMat);
            baseGlowStrip.position.y = 0.083;
            baseGroup.add(baseGlowStrip);

            // 4 Hidden corner anchor pads
            [[-0.48, -0.32], [0.48, -0.32], [-0.48, 0.32], [0.48, 0.32]].forEach(([ax, az]) => {
                const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 16), silverAlumMat);
                bolt.position.set(ax, 0.11, az);
                baseGroup.add(bolt);
            });
            tagGroup(baseGroup, 'legs');

            // =================================================================
            // 2. PELVIS & LEGS (LEFT & RIGHT)
            // =================================================================
            const pelvisGroup = new THREE.Group();
            pelvisGroup.position.y = 1.38;
            robotRoot.add(pelvisGroup);
            modularGroups.pelvis = pelvisGroup;

            const pelvisCore = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.22, 0.38), darkJointMat);
            pelvisGroup.add(pelvisCore);

            // Cyan horizontal pelvis accent bar (seen in photo)
            const pelvisCyanBar = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.025, 0.40), cyanGlowMat);
            pelvisCyanBar.position.set(0, 0.06, 0);
            pelvisGroup.add(pelvisCyanBar);
            tagGroup(pelvisGroup, 'legs');

            function createLeg(isLeft) {
                const side = isLeft ? 1 : -1;
                const legGroup = new THREE.Group();
                legGroup.position.set(side * 0.22, 0, 0);

                // Internal steel leg column (visible in X-Ray / Explode)
                const steelPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.25, 12), steelFrameMat);
                steelPillar.position.y = 0.70;
                legGroup.add(steelPillar);

                // Hip Joint
                const hipJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.22, 20), darkJointMat);
                hipJoint.rotation.z = Math.PI / 2;
                hipJoint.position.y = 1.28;
                legGroup.add(hipJoint);

                // Upper Thigh White Armor Shell
                const thighShell = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.46, 0.34), whiteArmorMat);
                thighShell.position.y = 1.02;
                legGroup.add(thighShell);

                // Thigh Vertical Blue Accent Strip (clean forward offset)
                const thighBlueStrip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 0.02), blueTrimMat);
                thighBlueStrip.position.set(0, 1.02, 0.175);
                legGroup.add(thighBlueStrip);

                // Mechanical Knee Joint Structure
                const kneeJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.25, 24), darkJointMat);
                kneeJoint.rotation.z = Math.PI / 2;
                kneeJoint.position.y = 0.72;
                legGroup.add(kneeJoint);

                const kneeCyanRing = new THREE.Mesh(new THREE.TorusGeometry(0.120, 0.006, 12, 28), cyanGlowMat);
                kneeCyanRing.rotation.y = Math.PI / 2;
                kneeCyanRing.position.set(0, 0.72, 0);
                legGroup.add(kneeCyanRing);

                // Lower Shin White Armor Shell
                const shinShell = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.46, 0.33), whiteArmorMat);
                shinShell.position.y = 0.42;
                legGroup.add(shinShell);

                // Shin Cyan Edge Trim
                const shinCyanTrim = new THREE.Mesh(new THREE.BoxGeometry(0.265, 0.015, 0.335), blueTrimMat);
                shinCyanTrim.position.set(0, 0.655, 0);
                legGroup.add(shinCyanTrim);

                // Black Inner/Side Shin Vent Insert
                const shinVent = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.30, 0.12), darkJointMat);
                shinVent.position.set(0, 0.38, -0.08);
                legGroup.add(shinVent);

                // Foot Enclosure with Internal Sensors
                const footBase = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.12, 0.48), whiteArmorMat);
                footBase.position.set(0, 0.16, 0.06);
                legGroup.add(footBase);

                const footToe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.07, 0.18), whiteArmorMat);
                footToe.position.set(0, 0.135, 0.26);
                footToe.rotation.x = 0.22;
                legGroup.add(footToe);

                const ankleBlack = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.04, 0.50), matteBlackMat);
                ankleBlack.position.set(0, 0.08, 0.06);
                legGroup.add(ankleBlack);

                tagGroup(legGroup, 'legs');
                return legGroup;
            }

            modularGroups.leftLeg = createLeg(true);
            modularGroups.rightLeg = createLeg(false);
            robotRoot.add(modularGroups.leftLeg);
            robotRoot.add(modularGroups.rightLeg);

            // =================================================================
            // 3. INTERNAL BRAIN CORE (APPLE MAC MINI M1, ESP32, FANS, PDU)
            // =================================================================
            const brainGroup = new THREE.Group();
            brainGroup.position.y = 1.92;
            robotRoot.add(brainGroup);
            modularGroups.brain = brainGroup;

            // Internal Steel Skeleton Cage inside Torso
            const internalCage = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.66, 0.36), new THREE.MeshBasicMaterial({
                color: 0x00d2ff,
                wireframe: true,
                transparent: true,
                opacity: 0.25
            }));
            brainGroup.add(internalCage);

            // Apple Mac mini (M1) Silver Unibody
            const macMiniBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.38), silverAlumMat);
            macMiniBody.position.set(0, 0.14, 0);
            brainGroup.add(macMiniBody);

            const macMiniTopLogo = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.085, 24), matteBlackMat);
            macMiniTopLogo.position.set(0, 0.14, 0);
            brainGroup.add(macMiniTopLogo);

            // ESP32 Microcontroller & Sensor Interface Board (Below Mac mini)
            const espBoard = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.025, 0.24), new THREE.MeshStandardMaterial({
                color: 0x065f46,
                roughness: 0.3,
                metalness: 0.5
            }));
            espBoard.position.set(0, -0.04, 0.02);
            brainGroup.add(espBoard);

            const espChip = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.035, 0.10), silverAlumMat);
            espChip.position.set(-0.05, -0.03, 0.02);
            brainGroup.add(espChip);

            const espStatusLed = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 12), cyanGlowMat);
            espStatusLed.position.set(0.10, -0.02, 0.08);
            brainGroup.add(espStatusLed);

            // Power Distribution Unit (Lower Torso)
            const pduBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.26), darkJointMat);
            pduBox.position.set(0, -0.22, 0);
            brainGroup.add(pduBox);

            // Dual Internal Cooling Fans on Backplate
            const backplateGroup = new THREE.Group();
            backplateGroup.position.set(0, 1.92, -0.24);
            robotRoot.add(backplateGroup);
            modularGroups.backplate = backplateGroup;

            const rearPanel = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.72, 0.05), darkJointMat);
            backplateGroup.add(rearPanel);

            function createCoolingFan(yOffset) {
                const fanGroup = new THREE.Group();
                fanGroup.position.set(0, yOffset, -0.03);
                const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.015, 12, 24), cyanGlowMat);
                fanGroup.add(ring);
                const blades = new THREE.Group();
                for (let i = 0; i < 6; i++) {
                    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.01), silverAlumMat);
                    blade.rotation.z = (i * Math.PI) / 3;
                    blades.add(blade);
                }
                fanGroup.add(blades);
                backplateGroup.add(fanGroup);
                return blades;
            }
            coolingFan1 = createCoolingFan(0.14);
            coolingFan2 = createCoolingFan(-0.14);

            tagGroup(brainGroup, 'brain');
            tagGroup(backplateGroup, 'brain');

            // =================================================================
            // 4. CHEST & TORSO OUTER SHELL + 10" CHEST TOUCHSCREEN
            // =================================================================
            const torsoGroup = new THREE.Group();
            torsoGroup.position.y = 1.92;
            robotRoot.add(torsoGroup);
            modularGroups.torso = torsoGroup;

            // Main White Outer Torso Armor
            const torsoShell = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.78, 0.46), whiteArmorMat);
            torsoGroup.add(torsoShell);

            // Black Side Shoulder Housings with Cyan Glow Rings
            [-0.38, 0.38].forEach(sx => {
                const sidePod = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.68, 0.40), darkJointMat);
                sidePod.position.set(sx, 0, 0);
                torsoGroup.add(sidePod);

                const cyanTrim = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.70, 0.025), blueTrimMat);
                cyanTrim.position.set(sx, 0, 0.20);
                torsoGroup.add(cyanTrim);
            });

            // 8 Corner Panel Bolts on Front Chest Armor (exact detail from photo!)
            [
                [-0.31, 0.33], [0.31, 0.33],
                [-0.31, -0.18], [0.31, -0.18],
                [-0.28, -0.33], [0.28, -0.33]
            ].forEach(([bx, by]) => {
                const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 12), matteBlackMat);
                bolt.rotation.x = Math.PI / 2;
                bolt.position.set(bx, by, 0.232);
                torsoGroup.add(bolt);
            });

            // Chest Touchscreen Bezel & Interactive Screen Mesh
            const chestBezel = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.48, 0.04), matteBlackMat);
            chestBezel.position.set(0, 0.06, 0.225);
            torsoGroup.add(chestBezel);

            const chestScreenMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(0.45, 0.43),
                new THREE.MeshBasicMaterial({
                    map: chestTexture,
                    polygonOffset: true,
                    polygonOffsetFactor: -1.5,
                    polygonOffsetUnits: -1.5,
                    depthWrite: false
                })
            );
            chestScreenMesh.position.set(0, 0.06, 0.250);
            torsoGroup.add(chestScreenMesh);

            tagGroup(torsoGroup, 'torso');

            // =================================================================
            // 5. MODULAR ARMS & STATIONARY GRIPPER HANDS (LEFT & RIGHT)
            // =================================================================
            function createArm(isLeft) {
                const side = isLeft ? 1 : -1;
                const armGroup = new THREE.Group();
                armGroup.position.set(side * 0.50, 2.18, 0);

                // Shoulder Actuator Joint
                const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.18, 24), darkJointMat);
                shoulder.rotation.z = Math.PI / 2;
                armGroup.add(shoulder);

                const shoulderCap = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.22), darkJointMat);
                shoulderCap.position.set(side * 0.04, 0.02, 0);
                armGroup.add(shoulderCap);

                // Upper Arm White Shell
                const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.36, 0.23), whiteArmorMat);
                upperArm.position.set(side * 0.05, -0.22, 0);
                armGroup.add(upperArm);

                // Elbow Mechanical Joint
                const elbow = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.18, 20), darkJointMat);
                elbow.rotation.z = Math.PI / 2;
                elbow.position.set(side * 0.05, -0.46, 0);
                armGroup.add(elbow);

                // Forearm / Lower Arm White Shell
                const lowerArm = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.36, 0.22), whiteArmorMat);
                lowerArm.position.set(side * 0.05, -0.70, 0.02);
                lowerArm.rotation.x = -0.06;
                armGroup.add(lowerArm);

                // Forearm Blue Accent Strip (clearance in front of lower arm)
                const armBlueTrim = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.32, 0.02), blueTrimMat);
                armBlueTrim.position.set(side * 0.05, -0.70, 0.136);
                armGroup.add(armBlueTrim);

                // Stationary Hand & Fingers Assembly
                const palm = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.14, 0.16), darkJointMat);
                palm.position.set(side * 0.05, -0.95, 0.03);
                armGroup.add(palm);

                // 3 Curved Fingers + Thumb
                [-0.04, 0, 0.04].forEach(fz => {
                    const finger = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.12, 0.032), matteBlackMat);
                    finger.position.set(side * 0.03, -1.05, 0.03 + fz);
                    finger.rotation.z = -side * 0.28;
                    armGroup.add(finger);
                });

                const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.04), matteBlackMat);
                thumb.position.set(side * 0.01, -0.98, 0.11);
                thumb.rotation.x = 0.4;
                armGroup.add(thumb);

                tagGroup(armGroup, isLeft ? 'leftArm' : 'rightArm');
                return armGroup;
            }

            modularGroups.leftArm = createArm(true);
            modularGroups.rightArm = createArm(false);
            robotRoot.add(modularGroups.leftArm);
            robotRoot.add(modularGroups.rightArm);

            // =================================================================
            // 6. HEAD SECTION (ANIMATED EYE DISPLAY, CAMERA, SIDE PODS)
            // =================================================================
            const headGroup = new THREE.Group();
            headGroup.position.y = 2.66;
            robotRoot.add(headGroup);
            modularGroups.head = headGroup;

            // Neck Joint & Rotary Mount
            const neckCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.16, 24), darkJointMat);
            neckCylinder.position.y = -0.28;
            headGroup.add(neckCylinder);

            const neckCyanRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.012, 12, 24), cyanGlowMat);
            neckCyanRing.rotation.x = Math.PI / 2;
            neckCyanRing.position.y = -0.25;
            headGroup.add(neckCyanRing);

            // Outer White Boxy Head Casing
            const headOuter = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.48, 0.46), whiteArmorMat);
            headGroup.add(headOuter);

            // Top Bevel & Camera / Distance Sensor Strip
            const headTopCap = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.04, 0.40), whiteArmorMat);
            headTopCap.position.y = 0.25;
            headGroup.add(headTopCap);

            const sensorBar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.08), matteBlackMat);
            sensorBar.position.set(0, 0.255, 0.16);
            headGroup.add(sensorBar);

            const camLens = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 12), cyanGlowMat);
            camLens.position.set(0, 0.26, 0.20);
            headGroup.add(camLens);

            // Recessed Black Face Bezel
            const faceBezel = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.39, 0.04), matteBlackMat);
            faceBezel.position.set(0, 0, 0.22);
            headGroup.add(faceBezel);

            // Dynamic Animated Eye & Smile Screen Mesh
            const faceScreenMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(0.58, 0.34),
                new THREE.MeshBasicMaterial({
                    map: faceTexture,
                    polygonOffset: true,
                    polygonOffsetFactor: -1.5,
                    polygonOffsetUnits: -1.5,
                    depthWrite: false
                })
            );
            faceScreenMesh.position.set(0, 0, 0.248);
            headGroup.add(faceScreenMesh);

            // Left & Right Circular Ear Speaker Pods with Cyan LED Rings (from photo!)
            [-0.38, 0.38].forEach(ex => {
                const earDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 28), darkJointMat);
                earDisc.rotation.z = Math.PI / 2;
                earDisc.position.set(ex, 0, 0);
                headGroup.add(earDisc);

                const earRing = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.010, 12, 28), cyanGlowMat);
                earRing.rotation.y = Math.PI / 2;
                earRing.position.set(ex + (ex > 0 ? 0.028 : -0.028), 0, 0);
                headGroup.add(earRing);
            });

            tagGroup(headGroup, 'head');
        }

        function buildFloorEnvironment() {
            // Circular cybernetic pedestal & 1.5m-3m greeting zone rings
            const gridHelper = new THREE.GridHelper(10, 20, 0x00d2ff, 0x1e293b);
            gridHelper.position.y = 0.005;
            scene.add(gridHelper);

            const ringGeo1 = new THREE.RingGeometry(1.15, 1.20, 64);
            const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00d2ff, side: THREE.DoubleSide, transparent: true, opacity: 0.55 });
            radarRing1 = new THREE.Mesh(ringGeo1, ringMat1);
            radarRing1.rotation.x = -Math.PI / 2;
            radarRing1.position.y = 0.015;
            scene.add(radarRing1);

            const ringGeo2 = new THREE.RingGeometry(1.75, 1.82, 64);
            const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x0066ff, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
            radarRing2 = new THREE.Mesh(ringGeo2, ringMat2);
            radarRing2.rotation.x = -Math.PI / 2;
            radarRing2.position.y = 0.012;
            scene.add(radarRing2);
        }

        /***********************************************************************
         * 4. FLOATING 3D CALLOUT PINS & VIEWPORT INTERACTION
         ***********************************************************************/
        function createCalloutDOMElements() {
            const container = document.getElementById('callouts-container');
            container.innerHTML = '';

            CALLOUT_DEFS.forEach(def => {
                const el = document.createElement('button');
                el.className = 'callout-pin px-2.5 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-400/60 text-left shadow-lg hover:bg-cyan-950/90 transition';
                el.innerHTML = `
                    <div class="flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                        <span class="font-display font-bold text-[11px] text-white whitespace-nowrap">${def.label}</span>
                    </div>
                    <div class="text-[9px] font-mono text-cyan-300 whitespace-nowrap">${def.sub}</div>
                `;
                el.onclick = (e) => {
                    e.stopPropagation();
                    inspectPart(def.key);
                };
                container.appendChild(el);
                calloutElements.push({ el, def });
            });
        }

        function updateCalloutPositions() {
            const container = document.getElementById('robot-canvas-container');
            if (!container) return;
            const width = container.clientWidth;
            const height = container.clientHeight;

            calloutElements.forEach(({ el, def }) => {
                if (!state.showLabels) {
                    el.style.opacity = '0';
                    el.style.pointerEvents = 'none';
                    return;
                }
                // Adjust world position based on current explode factor
                const worldPos = def.pos.clone();
                if (def.key === 'head') worldPos.y += state.explodeAmount * 0.55;
                if (def.key === 'torso') worldPos.z += state.explodeAmount * 0.55;
                if (def.key === 'leftArm') worldPos.x += state.explodeAmount * 0.55;

                worldPos.project(camera);

                const x = (worldPos.x * 0.5 + 0.5) * width;
                const y = (-(worldPos.y * 0.5) + 0.5) * height;

                if (worldPos.z < 1 && x > 30 && x < width - 30 && y > 40 && y < height - 50) {
                    el.style.left = `${x}px`;
                    el.style.top = `${y}px`;
                    el.style.opacity = '1';
                    el.style.pointerEvents = 'auto';
                } else {
                    el.style.opacity = '0';
                    el.style.pointerEvents = 'none';
                }
            });
        }

        function setupViewportInteractions(container) {
            let isDragging = false;
            let prevX = 0;
            let prevY = 0;
            let downX = 0;
            let downY = 0;

            const raycaster = new THREE.Raycaster();
            const mouseVec = new THREE.Vector2();

            container.addEventListener('mousedown', e => {
                isDragging = true;
                prevX = downX = e.clientX;
                prevY = downY = e.clientY;
                state.autoRotate = false;
                updateAutoRotateButton();
            });

            window.addEventListener('mouseup', e => {
                if (!isDragging) return;
                isDragging = false;

                // Check if it was a click on a 3D robot part
                const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
                if (dist < 6) {
                    const rect = container.getBoundingClientRect();
                    if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                        mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                        mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                        raycaster.setFromCamera(mouseVec, camera);
                        const hits = raycaster.intersectObjects(robotRoot.children, true);
                        if (hits.length > 0) {
                            const partKey = hits[0].object.userData.partKey;
                            if (partKey) inspectPart(partKey);
                        }
                    }
                }
            });

            window.addEventListener('mousemove', e => {
                // Update studio mouse coordinates relative to studio canvas center
                const rect = container.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const normX = (e.clientX - centerX) / (rect.width / 2 || window.innerWidth / 2);
                const normY = (e.clientY - centerY) / (rect.height / 2 || window.innerHeight / 2);
                studioMouse.targetX = THREE.MathUtils.clamp(normX, -1.2, 1.2);
                studioMouse.targetY = THREE.MathUtils.clamp(normY, -1.0, 1.0);

                state.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
                state.mouseY = (e.clientY / window.innerHeight) * 2 - 1;

                if (!isDragging) return;
                const dx = e.clientX - prevX;
                const dy = e.clientY - prevY;
                prevX = e.clientX;
                prevY = e.clientY;

                camState.targetTheta -= dx * 0.008;
                camState.targetPhi = Math.max(0.45, Math.min(1.75, camState.targetPhi - dy * 0.006));
            });

            // Touch events for mobile orbit
            container.addEventListener('touchstart', e => {
                if (e.touches.length === 1) {
                    isDragging = true;
                    prevX = e.touches[0].clientX;
                    prevY = e.touches[0].clientY;
                    state.autoRotate = false;
                }
            }, { passive: true });

            window.addEventListener('touchend', () => { isDragging = false; });

            window.addEventListener('touchmove', e => {
                if (!isDragging || e.touches.length !== 1) return;
                const dx = e.touches[0].clientX - prevX;
                const dy = e.touches[0].clientY - prevY;
                prevX = e.touches[0].clientX;
                prevY = e.touches[0].clientY;

                camState.targetTheta -= dx * 0.008;
                camState.targetPhi = Math.max(0.45, Math.min(1.75, camState.targetPhi - dy * 0.006));
            }, { passive: true });

            // Scroll Wheel Zoom
            container.addEventListener('wheel', e => {
                e.preventDefault();
                camState.targetRadius = Math.max(1.8, Math.min(7.2, camState.targetRadius + e.deltaY * 0.0025));
            }, { passive: false });
        }

        function onWindowResize() {
            const container = document.getElementById('robot-canvas-container');
            if (container && renderer && camera) {
                const width = container.clientWidth;
                const height = container.clientHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }

            const heroContainer = document.getElementById('hero-robot-canvas-container');
            if (heroContainer && heroRenderer && heroCamera) {
                const hw = heroContainer.clientWidth;
                const hh = heroContainer.clientHeight;
                heroCamera.aspect = hw / hh;
                heroCamera.updateProjectionMatrix();
                heroRenderer.setSize(hw, hh);
            }
        }

        /***********************************************************************
         * 5. STUDIO CONTROLS: EXPLODE, X-RAY, CAMERA PRESETS & PART INSPECTOR
         ***********************************************************************/
        function setExplodeAmount(val) {
            const pct = Number(val);
            state.targetExplode = pct / 100;
            const slider = document.getElementById('explode-slider');
            if (slider) slider.value = pct;
            const badge = document.getElementById('explode-pct-badge');
            if (badge) badge.textContent = pct === 0 ? '0% ASSEMBLED' : `${pct}% EXPLODED`;
            const btn = document.getElementById('explode-btn');
            if (btn) {
                btn.innerHTML = pct > 50
                    ? '<i class="fa-solid fa-compress mr-1"></i>Assemble 0%'
                    : '<i class="fa-solid fa-maximize mr-1"></i>Explode 100%';
            }

            if (pct > 35) {
                inspectPart('brain', false);
            }
        }

        function toggleExplodeView() {
            const nextVal = state.targetExplode > 0.5 ? 0 : 100;
            setExplodeAmount(nextVal);
            playCyberBeep(nextVal > 0 ? 640 : 420);
        }

        function toggleXRayMode() {
            state.xrayMode = !state.xrayMode;
            shellMaterials.forEach(mat => {
                mat.transparent = state.xrayMode;
                mat.opacity = state.xrayMode ? 0.26 : 1.0;
                mat.wireframe = false;
                mat.needsUpdate = true;
            });
            const btn = document.getElementById('xray-btn');
            if (btn) {
                btn.className = state.xrayMode
                    ? 'px-3 py-2.5 rounded-2xl bg-[#0071e3] text-white font-medium flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer'
                    : 'px-3 py-2.5 rounded-2xl bg-white hover:bg-black/[0.03] border border-black/[0.08] text-[#1d1d1f] font-medium flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer';
            }
            if (state.xrayMode) inspectPart('brain', false);
            playCyberBeep(520);
        }

        function toggleCalloutLabels() {
            state.showLabels = !state.showLabels;
            const btn = document.getElementById('labels-btn');
            if (btn) {
                btn.innerHTML = `<i class="fa-solid fa-tag"></i><span>3D Pins: ${state.showLabels ? 'ON' : 'OFF'}</span>`;
                btn.className = state.showLabels
                    ? 'px-3 py-2.5 rounded-2xl bg-[#0071e3] text-white font-medium flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer'
                    : 'px-3 py-2.5 rounded-2xl bg-white hover:bg-black/[0.03] border border-black/[0.08] text-[#1d1d1f] font-medium flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer';
            }
        }

        function toggleAutoRotate() {
            state.autoRotate = !state.autoRotate;
            updateAutoRotateButton();
        }

        function updateAutoRotateButton() {
            const btn = document.getElementById('autorotate-btn');
            if (!btn) return;
            btn.className = state.autoRotate
                ? 'px-3 py-2.5 rounded-2xl bg-[#0071e3] text-white font-medium flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer'
                : 'px-3 py-2.5 rounded-2xl bg-white hover:bg-black/[0.03] border border-black/[0.08] text-[#1d1d1f] font-medium flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer';
        }

        function toggleGreetingRadar() {
            state.showRadar = !state.showRadar;
            if (radarRing1) radarRing1.visible = state.showRadar;
            if (radarRing2) radarRing2.visible = state.showRadar;
            const btn = document.getElementById('radar-btn');
            if (btn) {
                btn.innerHTML = `<i class="fa-solid fa-satellite-dish"></i><span>Radar: ${state.showRadar ? 'ON' : 'OFF'}</span>`;
                btn.className = state.showRadar
                    ? 'px-3 py-2.5 rounded-2xl bg-[#0071e3] text-white font-medium flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer'
                    : 'px-3 py-2.5 rounded-2xl bg-white hover:bg-black/[0.03] border border-black/[0.08] text-[#1d1d1f] font-medium flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer';
            }
        }

        function setCameraPreset(preset) {
            state.autoRotate = false;
            updateAutoRotateButton();

            // Update active preset button styles
            document.querySelectorAll('.cam-preset-btn').forEach(btn => {
                btn.className = 'cam-preset-btn px-3.5 py-1 rounded-full text-[#6e6e73] hover:text-[#1d1d1f] transition cursor-pointer';
            });
            const activeBtn = document.querySelector(`.cam-preset-btn[onclick*="${preset}"]`);
            if (activeBtn) {
                activeBtn.className = 'cam-preset-btn px-3.5 py-1 rounded-full bg-white text-[#1d1d1f] shadow-2xs font-semibold transition cursor-pointer';
            }

            if (preset === 'full' || preset === 'front') {
                camState.targetTheta = 0.0;
                camState.targetPhi = 1.50;
                camState.targetRadius = 4.2;
                camState.targetLookY = 1.35;
                inspectPart('full', false);
            } else if (preset === 'side') {
                camState.targetTheta = 1.35;
                camState.targetPhi = 1.48;
                camState.targetRadius = 4.2;
                camState.targetLookY = 1.35;
                inspectPart('leftArm', false);
            } else if (preset === 'iso') {
                camState.targetTheta = 0.62;
                camState.targetPhi = 1.32;
                camState.targetRadius = 4.3;
                camState.targetLookY = 1.35;
                inspectPart('full', false);
            } else if (preset === 'head') {
                camState.targetTheta = 0.0;
                camState.targetPhi = 1.52;
                camState.targetRadius = 1.95;
                camState.targetLookY = 2.66;
                inspectPart('head', false);
            } else if (preset === 'chest' || preset === 'torso') {
                camState.targetTheta = 0.0;
                camState.targetPhi = 1.50;
                camState.targetRadius = 2.20;
                camState.targetLookY = 1.92;
                inspectPart('torso', false);
            } else if (preset === 'base' || preset === 'legs') {
                camState.targetTheta = 0.0;
                camState.targetPhi = 1.35;
                camState.targetRadius = 2.80;
                camState.targetLookY = 0.65;
                inspectPart('legs', false);
            }
            playCyberBeep(580);
        }

        function inspectPart(partKey, moveCam = true) {
            const info = PART_SPECS[partKey];
            if (!info) return;
            const tagEl = document.getElementById('part-tag');
            if (tagEl) tagEl.textContent = info.tag;

            const titleEl = document.getElementById('part-title') || document.getElementById('inspector-title');
            if (titleEl) titleEl.textContent = info.title;

            const descEl = document.getElementById('part-desc') || document.getElementById('inspector-desc');
            if (descEl) descEl.textContent = info.desc;

            const specsEl = document.getElementById('inspector-specs');
            if (specsEl) {
                specsEl.innerHTML = `
                    <div class="p-2 rounded-xl bg-white border border-black/[0.06] text-[#0071e3] font-semibold truncate">${info.spec1}</div>
                    <div class="p-2 rounded-xl bg-white border border-black/[0.06] text-[#1d1d1f] font-semibold truncate">${info.spec2}</div>
                `;
            }
            if (moveCam) {
                if (partKey === 'head') setCameraPreset('head');
                else if (partKey === 'torso' || partKey === 'brain') setCameraPreset('torso');
                else if (partKey === 'leftArm' || partKey === 'rightArm') setCameraPreset('side');
                else if (partKey === 'legs') setCameraPreset('legs');
            }
        }

        /***********************************************************************
         * 6. PROFILES, EXPRESSIONS, 8 MODES & KIOSK SIMULATOR
         ***********************************************************************/
        function switchProfile() {
            state.profile = 'university';
            const badge = document.getElementById('active-profile-badge');
            if (badge) badge.textContent = 'UNIVERSITY';
            selectOperatingMode('entrance');
        }

        function setFaceExpression(exp) {
            state.expression = exp;
            const moodLabel = document.getElementById('current-mood-label');
            if (moodLabel) moodLabel.textContent = exp.toUpperCase();

            document.querySelectorAll('.exp-btn').forEach(btn => {
                const isTarget = btn.getAttribute('data-exp-btn') === exp;
                btn.className = isTarget
                    ? 'exp-btn py-2 rounded-xl bg-[#0071e3] text-white font-semibold transition cursor-pointer'
                    : 'exp-btn py-2 rounded-xl bg-white hover:bg-black/[0.04] border border-black/[0.07] text-[#1d1d1f] font-medium transition cursor-pointer';
            });

            playCyberBeep(exp === 'guardian' ? 300 : 660);
        }

        function selectOperatingMode(mode) {
            state.mode = mode;

            // Highlight active Apple segmented mode button
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('is-active');
            });
            const activeBtn = document.getElementById(`mode-btn-${mode}`);
            if (activeBtn) {
                activeBtn.classList.add('is-active');
            }

            // Update face expression automatically for context
            if (mode === 'guardian') setFaceExpression('guardian');
            else if (mode === 'sleep') setFaceExpression('sleep');
            else if (mode === 'ai') setFaceExpression('thinking');
            else setFaceExpression('happy');

            // Update Kiosk Simulator DOM
            renderKioskDOM(mode);
        }

        // Reception is the only mode the robot ships with.
        function renderKioskDOM() {
            const pill = document.getElementById('kiosk-mode-pill');
            const screen = document.getElementById('kiosk-dynamic-screen');
            if (pill) pill.textContent = 'RECEPTION';
            if (!screen || screen.dataset.rendered) return;
            screen.dataset.rendered = '1';
            const tile = (q, title, sub) =>
                `<button class="kiosk-tile" onclick="simulateVoiceQuery('${q}')"><span>${title}</span><small>${sub}</small></button>`;
            screen.innerHTML = `
                <p class="kiosk-kicker">Reception</p>
                <h4 class="kiosk-title">How can I help you today?</h4>
                <div class="kiosk-tiles">
                    ${tile('How do I find a room?', 'Directions', 'Find a room or office')}
                    ${tile('What events are on today?', 'Events', 'What is on today')}
                    ${tile('Tell me about yourself', 'About me', 'Who built CYNO BOT')}
                    ${tile('How do I use you?', 'How to use', 'Talk or tap')}
                </div>`;
        }


        function getCynoAudioCtx() {
            try {
                if (!_cynoAudioCtx) {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (AudioCtx) _cynoAudioCtx = new AudioCtx();
                }
                if (_cynoAudioCtx && _cynoAudioCtx.state === 'suspended') {
                    _cynoAudioCtx.resume().catch(() => {});
                }
                return _cynoAudioCtx;
            } catch (e) {
                return null;
            }
        }

        function playCyberBeep(freq = 540, type = 'sine', duration = 0.14, volume = 0.08) {
            if (state && state.voiceMuted) return;
            try {
                const ctx = getCynoAudioCtx();
                if (!ctx) return;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                gain.gain.setValueAtTime(volume, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + duration);
            } catch (e) {
                // Ignore audio context autoplay restrictions if not yet interacted
            }
        }

        window._cynoSpeechUtterance = null; // Prevent Chromium GC mid-speech

        function speakRobotText(text) {
            const bubbleEl = document.getElementById('robot-speech-bubble');
            if (bubbleEl) bubbleEl.textContent = `"${text}"`;
            if (state && state.voiceMuted) return;
            if (!('speechSynthesis' in window)) return;
            try {
                window.speechSynthesis.resume();
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                }
                const utter = new SpeechSynthesisUtterance(text);
                window._cynoSpeechUtterance = utter;
                utter.rate = 1.02;
                utter.pitch = 1.08;
                utter.onstart = () => { state.expression = 'listening'; };
                utter.onend = () => { 
                    if (state.mode !== 'guardian' && state.mode !== 'sleep') state.expression = 'happy'; 
                    window._cynoSpeechUtterance = null;
                };
                utter.onerror = () => { window._cynoSpeechUtterance = null; };
                setTimeout(() => {
                    try {
                        window.speechSynthesis.resume();
                        window.speechSynthesis.speak(utter);
                    } catch (e) {}
                }, 40);
            } catch (err) {
                // Fallback if speech synthesis is unavailable
            }
        }

        function toggleVoiceMute() {
            state.voiceMuted = !state.voiceMuted;
            const icon = document.getElementById('voice-icon');
            const label = document.getElementById('voice-label');
            if (state.voiceMuted) {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                if (icon) icon.className = 'fa-solid fa-volume-xmark text-[#ff375f] text-xs';
                if (label) label.textContent = 'Voice: MUTE';
            } else {
                if (icon) icon.className = 'fa-solid fa-volume-high text-[#0071e3] text-xs';
                if (label) label.textContent = 'Voice: ON';
                speakRobotText('CYNO BOT voice system online.');
            }
        }

        function triggerQuickGreeting(lang = 'en') { if (typeof heroWave !== 'undefined') { heroWave.active = true; heroWave.time = 0; }
            setFaceExpression('happy');
            speakRobotText('Welcome to the university! I am CYNO BOT. How can I help you today?');
            const bubble = document.getElementById('robot-speech-bubble');
            if (bubble) {
                bubble.textContent = '"Welcome to IIT Campus! I am CYNO BOT. How can I help you today?"';
            }
        }

        function escapeChatText(text) {
            return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        }

        function appendChatLog(speaker, msg, isBot = true) {
            const log = document.getElementById('chat-log');
            if (!log) return;
            const row = document.createElement('div');
            row.className = isBot ? 'chat-row' : 'chat-row me';
            row.innerHTML = isBot
                ? `<span class="chat-avatar">CB</span><span class="chat-bubble">${escapeChatText(msg)}</span>`
                : `<span class="chat-bubble">${escapeChatText(msg)}</span>`;
            log.appendChild(row);
            log.scrollTop = log.scrollHeight;
        }

        function askCynoBot(question) {
            simulateVoiceQuery(question);
        }

        function handleCustomQuestion(e) {
            e.preventDefault();
            const input = document.getElementById('custom-question-input');
            if (!input) return;
            const val = input.value.trim();
            if (!val) return;
            input.value = '';
            simulateVoiceQuery(val);
        }

        // 6-Step Greeting Flow Controller
        function activateGreetingStep(step) {
            for (let i = 1; i <= 6; i++) {
                const card = document.getElementById(`flow-step-${i}`);
                if (card) {
                    const isActive = (i === step);
                    card.classList.toggle('active-step', isActive);
                    const iconBadge = card.querySelector('.step-icon');
                    if (iconBadge) {
                        iconBadge.classList.toggle('is-on', isActive);
                    }
                }
            }

            if (step === 1) {
                state.showRadar = true;
                if (radarRing1) radarRing1.visible = true;
                setFaceExpression('listening');
                speakRobotText('Step 1 Detect: Visitor detected entering the 1.5 to 3 meter greeting zone.');
            } else if (step === 2) {
                setFaceExpression('wink');
                speakRobotText('Step 2 Attend: Animated eyes look toward the visitor with a friendly expression.');
            } else if (step === 3) {
                setFaceExpression('happy');
                selectOperatingMode('entrance');
                speakRobotText('Step 3 Greet: Welcome to the university! How can I help you today?');
            } else if (step === 4) {
                selectOperatingMode('entrance');
                speakRobotText('Step 4 Offer Help: How can I help you today? You can touch Map, Events, or Questions on my chest display.');
            } else if (step === 5) {
                setFaceExpression('listening');
                speakRobotText('Step 5 Converse: Visitors ask their questions out loud, and I answer by voice with details on my chest screen.');
            } else if (step === 6) {
                setFaceExpression('happy');
                speakRobotText('Step 6 Close: Thank you and have a lovely day! Returning to low-power idle.');
            }
        }

        function playFullGreetingSequence() {
            let current = 1;
            activateGreetingStep(current);
            const interval = setInterval(() => {
                current++;
                if (current > 6) {
                    clearInterval(interval);
                } else {
                    activateGreetingStep(current);
                }
            }, 3400);
        }

        /***********************************************************************
         * 8. INTERACTIVE BUDGET TABLE (PAGE 19 DATA)
         ***********************************************************************/
        const BUDGET_ITEMS = [
            { name: 'Body shell: PVC sheets & 3D-printing filament', low: 40000, high: 90000 },
            { name: 'Microcontrollers (ESP32), wiring, connectors', low: 15000, high: 30000 },
            { name: 'Chest touchscreen & animated eye displays', low: 30000, high: 55000 },
            { name: 'USB Camera, microphone array, stereo speaker', low: 35000, high: 65000 },
            { name: 'Sensors (air quality, flame, distance, touch)', low: 10000, high: 20000 },
            { name: 'Power supplies, UPS/battery, cut-off switch', low: 30000, high: 55000 },
            { name: 'Steel frame, weighted base, paint & finishing', low: 25000, high: 50000 },
            { name: 'Cloud & API fallback usage (9 months)', low: 10000, high: 40000 }
        ];

        function setBudgetTier(tier) {
            ['low', 'mid', 'high'].forEach(t => {
                const btn = document.getElementById(`budget-${t}-btn`);
                if (btn) {
                    btn.className = t === tier
                        ? 'px-3 py-1 rounded-full bg-[#0071e3] text-white font-semibold transition cursor-pointer shadow-xs'
                        : 'px-3 py-1 rounded-full text-[#86868b] hover:text-[#1d1d1f] transition cursor-pointer';
                }
            });

            const container = document.getElementById('budget-rows');
            if (!container) return;
            let subtotal = 0;
            container.innerHTML = BUDGET_ITEMS.map(item => {
                const val = tier === 'low' ? item.low : tier === 'high' ? item.high : Math.round((item.low + item.high) / 2);
                subtotal += val;
                return `
                    <div class="flex justify-between items-center py-1.5 border-b border-black/[0.04]">
                        <span class="text-[#1d1d1f] truncate pr-2">${item.name}</span>
                        <span class="text-[#0071e3] font-bold shrink-0">LKR ${val.toLocaleString()}</span>
                    </div>
                `;
            }).join('');

            const contingency = Math.round(subtotal * 0.10);
            const total = subtotal + contingency;

            container.innerHTML += `
                <div class="flex justify-between items-center pt-2 text-[#86868b] font-medium">
                    <span>Subtotal</span>
                    <span>LKR ${subtotal.toLocaleString()}</span>
                </div>
                <div class="flex justify-between items-center text-amber-600 font-medium">
                    <span>Contingency (10%)</span>
                    <span>LKR ${contingency.toLocaleString()}</span>
                </div>
            `;

            const totalDisplay = document.getElementById('budget-total-display');
            if (totalDisplay) totalDisplay.textContent = `LKR ${total.toLocaleString()}`;
            const rangeTag = document.getElementById('budget-range-tag');
            if (rangeTag) {
                rangeTag.textContent =
                    tier === 'low' ? 'Lean Build' : tier === 'high' ? 'Commercial Spec' : 'Balanced Target';
            }
        }

        /***********************************************************************
         * 9. STANDALONE WEBSITE HTML DOWNLOADER
         ***********************************************************************/
        function downloadStandaloneHTML() {
            const htmlContent = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'CYNO_BOT_3D_Showcase_CYNOCOR_G40.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            playCyberBeep(780);
        }

        /***********************************************************************
         * 10. MAIN ANIMATION LOOP & WINDOW ONLOAD INITIALIZATION
         ***********************************************************************/
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            const elapsed = clock.getElapsedTime();

            // 1. Natural Eye Blinking Timer
            state.blinkTimer += 0.016;
            if (state.blinkTimer > 3.8) {
                state.isBlinking = true;
                if (state.blinkTimer > 4.0) {
                    state.isBlinking = false;
                    state.blinkTimer = 0;
                }
            }

            // 2. Smoothly Interpolate 6-Part Modular Exploded View
            state.explodeAmount += (state.targetExplode - state.explodeAmount) * 0.08;
            const e = state.explodeAmount;

            // Smoothly interpolate studio mouse head tracking coordinates
            studioMouse.x += (studioMouse.targetX - studioMouse.x) * 0.08;
            studioMouse.y += (studioMouse.targetY - studioMouse.y) * 0.08;
            if (renderer && scene && camera && heroRobotRoot && !heroRenderer) {
                heroExplodedParts.forEach(part => {
                    part.obj.position.lerpVectors(part.basePos, part.basePos.clone().add(part.deltaPos), e);
                });
                if (heroTorsoOuterMat) {
                    const targetOp = state.xrayMode ? 0.24 : (1.0 - e * 0.78);
                    heroTorsoOuterMat.opacity = Math.max(0.18, targetOp);
                    heroTorsoOuterMat.depthWrite = (!state.xrayMode && e < 0.08);
                }
                if (heroHead) {
                    heroHead.rotation.y = studioMouse.x * 0.42;
                    heroHead.rotation.x = studioMouse.y * 0.35;
                    heroHead.rotation.z = -studioMouse.x * 0.05;
                }
                if (heroTorso) {
                    heroTorso.rotation.y = studioMouse.x * 0.14;
                    heroTorso.rotation.x = studioMouse.y * 0.10;
                }
                if (heroFaceEyesGroup) {
                    heroFaceEyesGroup.position.x = studioMouse.x * 0.018;
                    heroFaceEyesGroup.position.y = -studioMouse.y * 0.012;
                }
                if (heroEyeMaterials && heroEyeMaterials.length) {
                    const expHex = state.expression === 'guardian' ? 0xff3b5c : state.expression === 'sleep' ? 0x64748b : state.expression === 'thinking' ? 0xf59e0b : state.expression === 'listening' ? 0x10b981 : 0x00f0ff;
                    heroEyeMaterials.forEach(m => { m.color.setHex(expHex); if (m.emissive) m.emissive.setHex(expHex); });
                }
                if (heroLeftEyeRing && heroRightEyeRing) {
                    const lScale = (state.isBlinking || state.expression === 'sleep') ? 0.12 : 1.0;
                    const rScale = (state.isBlinking || state.expression === 'sleep' || state.expression === 'wink') ? 0.12 : 1.0;
                    heroLeftEyeRing.scale.y += (lScale - heroLeftEyeRing.scale.y) * 0.35;
                    heroRightEyeRing.scale.y += (rScale - heroRightEyeRing.scale.y) * 0.35;
                }
                if (heroSmileArc) {
                    heroSmileArc.scale.y = (state.expression === 'listening') ? (1.0 + Math.abs(Math.sin(elapsed * 14)) * 0.75) : (state.expression === 'sleep' ? 0.3 : 1.0);
                }
                if (heroWave.active && heroRightArmPivot && heroRightForearmPivot) {
                    heroWave.time += 0.024;
                    const t = heroWave.time;
                    if (t < heroWave.duration) {
                        const easeRaise = Math.sin(Math.min(1, t * 2.4) * Math.PI / 2);
                        heroRightArmPivot.rotation.set(easeRaise * 0.40, -easeRaise * 0.20, -easeRaise * 1.15);
                        heroRightForearmPivot.rotation.set(0, Math.sin(t * 14) * 0.42, -easeRaise * 1.45);
                    } else {
                        heroRightArmPivot.rotation.z *= 0.85; heroRightArmPivot.rotation.x *= 0.85; heroRightArmPivot.rotation.y *= 0.85;
                        heroRightForearmPivot.rotation.z *= 0.85; heroRightForearmPivot.rotation.y *= 0.85;
                        if (Math.abs(heroRightArmPivot.rotation.z) < 0.02) { heroRightArmPivot.rotation.set(0,0,0); heroRightForearmPivot.rotation.set(0,0,0); heroWave.active = false; }
                    }
                }
                heroRobotRoot.position.y = Math.sin(elapsed * 2.2) * 0.012;
            }

            if (modularGroups.head) {
                // Subtle idle breathing + exploded offset
                modularGroups.head.position.y = 2.66 + e * 0.58 + Math.sin(elapsed * 2.2) * 0.008;
                // Fluid cursor look-at for 3D studio robot
                modularGroups.head.rotation.y = studioMouse.x * 0.40;
                modularGroups.head.rotation.x = studioMouse.y * 0.30;
                modularGroups.head.rotation.z = -studioMouse.x * 0.05;
            }
            if (modularGroups.torso) {
                modularGroups.torso.position.z = e * 0.62;
                modularGroups.torso.position.y = 1.92 + Math.sin(elapsed * 2.2) * 0.005;
            }
            if (modularGroups.backplate) {
                modularGroups.backplate.position.z = -0.24 - e * 0.55;
            }
            if (modularGroups.leftArm) {
                modularGroups.leftArm.position.x = 0.50 + e * 0.58;
                modularGroups.leftArm.position.y = 2.18 + e * 0.15;
            }
            if (modularGroups.rightArm) {
                modularGroups.rightArm.position.x = -0.50 - e * 0.58;
                modularGroups.rightArm.position.y = 2.18 + e * 0.15;
            }
            // Dual Legs: 2 distinct parallel legs standing symmetrically shoulder-width apart
            if (modularGroups.leftLeg) {
                modularGroups.leftLeg.position.x = 0.22 + e * 0.28;
            }
            if (modularGroups.rightLeg) {
                modularGroups.rightLeg.position.x = -0.22 - e * 0.28;
            }
            if (modularGroups.base) {
                modularGroups.base.position.y = -e * 0.25;
            }

            // 3. Spin Internal Cooling Fans & Pulse Greeting Radar Rings
            if (coolingFan1) coolingFan1.rotation.z = elapsed * 8;
            if (coolingFan2) coolingFan2.rotation.z = -elapsed * 8;

            if (radarRing1 && state.showRadar) {
                const s1 = 1 + Math.sin(elapsed * 2.5) * 0.04;
                radarRing1.scale.set(s1, s1, 1);
            }
            if (radarRing2 && state.showRadar) {
                const s2 = 1 + Math.cos(elapsed * 2.0) * 0.05;
                radarRing2.scale.set(s2, s2, 1);
            }

            // 4. Smooth Camera Orbit Interpolation
            if (state.autoRotate) {
                camState.targetTheta += 0.005;
            }
            camState.theta += (camState.targetTheta - camState.theta) * 0.08;
            camState.phi += (camState.targetPhi - camState.phi) * 0.08;
            camState.radius += (camState.targetRadius - camState.radius) * 0.08;
            camState.targetY += (camState.targetLookY - camState.targetY) * 0.08;

            if (camera) camera.position.x = camState.radius * Math.sin(camState.phi) * Math.sin(camState.theta);
            if (camera) camera.position.y = camState.targetY + camState.radius * Math.cos(camState.phi);
            if (camera) camera.position.z = camState.radius * Math.sin(camState.phi) * Math.cos(camState.theta);
            if (camera) camera.lookAt(0, camState.targetY, 0);

            // 5. Render Dynamic 2D Canvas Textures for Face & Chest Screens
            renderFaceScreenTexture(elapsed);
            renderChestScreenTexture(elapsed);

            // 6. Update Floating 3D Callout Labels
            updateCalloutPositions();

            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }

            // 7. Render Hero 3D Interactive Humanoid Robot
            if (heroRenderer && heroScene && heroCamera) {
                renderHeroRobot(elapsed);
                heroRenderer.render(heroScene, heroCamera);
            }
        }

        /***********************************************************************
         * 11. HERO SECTION INTERACTIVE 3D ROBOT ENGINE
         * Realistic Humanoid Digital Twin with Real-time Mouse Parallax Tracking,
         * Interactive Arm Gestures (Wave), Dynamic Mood Lighting, and Voice Responses.
         ***********************************************************************/
        let heroScene, heroCamera, heroRenderer;
        let heroRobotRoot, heroHead, heroTorso, heroRightArmPivot, heroRightForearmPivot, heroRightArm, heroLeftArm, heroPelvis, heroLegs, heroBase;
        let heroRimLight, heroFloorLight;
        let heroSpeaking = false;
        let heroEyeMaterials = [], heroGlowMaterials = [];
        let heroExplodedParts = [];
        const heroMouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        let heroIsDragging = false, heroPrevMouseX = 0, heroRotationY = 0, heroTargetRotationY = 0;
        const heroWave = { active: false, time: 0, duration: 2.8 };
        let heroMoodIndex = 0;
        const HERO_MOODS = [
            { name: 'Cyan Glow', hex: 0x00d2ff, cssColor: '#00d2ff', soundFreq: 580, text: 'Cyan Sensors Active • Nominal Hospitality Mode' },
            { name: 'Emerald AI', hex: 0x10b981, cssColor: '#10b981', soundFreq: 640, text: 'Neural Vision Active • All Subsystems Online' },
            { name: 'Electric Violet', hex: 0x8b5cf6, cssColor: '#8b5cf6', soundFreq: 720, text: 'Deep Learning Core • Mac mini M1 Engaged' },
            { name: 'Cyber Amber', hex: 0xf59e0b, cssColor: '#f59e0b', soundFreq: 520, text: 'Diagnostic Scan • Ultrasonic & LiDAR Active' },
            { name: 'Ruby Focus', hex: 0xef4444, cssColor: '#ef4444', soundFreq: 440, text: 'Autonomous Sentry • Hospitality Protocol Ready' }
        ];

        // Scrollytelling Simulation State
        let heroScrollProgress = 0;
        let heroTargetScrollProgress = 0;
        let heroExplodeAmount = 0;
        const heroCamCurrentLookAt = new THREE.Vector3(0, 1.72, 0);

        function initHeroThreeJS() {
            const container = document.getElementById('hero-robot-canvas-container');
            if (!container) return;

            const width = container.clientWidth || window.innerWidth;
            const height = container.clientHeight || window.innerHeight;

            heroScene = new THREE.Scene();
            const isMobile = (width < 768) || (width / height < 1.0);
            const initCamZ = isMobile ? 5.8 : 4.8;
            heroCamera = new THREE.PerspectiveCamera(38, width / height, 0.05, 40);
            heroCamera.position.set(0, 1.72, isMobile ? 4.6 : 3.2); heroCamera.lookAt(0, 1.72, 0);
            heroCamera.lookAt(0, 1.72, 0);

            // Enabled logarithmicDepthBuffer for maximum depth precision without mesh blinking/Z-fighting
            heroRenderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                logarithmicDepthBuffer: true,
                powerPreference: 'high-performance'
            });
            heroRenderer.setSize(width, height);
            heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            heroRenderer.shadowMap.enabled = true;
            heroRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

            container.innerHTML = '';
            container.appendChild(heroRenderer.domElement);

            // Studio Lighting Setup for Photorealistic Robotics Rendering
            const ambient = new THREE.AmbientLight(0xdbeafe, 1.1);
            heroScene.add(ambient);

            const key = new THREE.DirectionalLight(0xffffff, 1.5);
            key.position.set(3.5, 6, 4.5);
            key.castShadow = true;
            key.shadow.bias = -0.0005;
            key.shadow.normalBias = 0.02;
            heroScene.add(key);

            heroRimLight = new THREE.PointLight(0x00d2ff, 2.6, 12);
            heroRimLight.position.set(-3.5, 3.2, -2.5);
            heroScene.add(heroRimLight);

            const fill = new THREE.PointLight(0x2563eb, 1.6, 10);
            fill.position.set(3, 1.5, 2.5);
            heroScene.add(fill);

            heroFloorLight = new THREE.PointLight(0x00d2ff, 2.0, 5);
            heroFloorLight.position.set(0, 0.15, 0.8);
            heroScene.add(heroFloorLight);

            // Build Full Realistic 3D Humanoid Robot with CAD Exploded Modules
            buildHeroRobotModel();

            // Bind Quick Action Buttons
            bindHeroActionButtons();

            // Setup Mouse Cursor Tracking & Drag Orbit
            setupHeroMouseInteractions(container);

            const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            HERO_INTRO.start = reduceMotion ? null : performance.now() + 120;
            if (reduceMotion) HERO_INTRO.waved = true;

            // Responsive Window Resize Handler
            window.addEventListener('resize', () => {
                if (container && heroRenderer && heroCamera) {
                    const w = container.clientWidth || window.innerWidth;
                    const h = container.clientHeight || window.innerHeight;
                    heroCamera.aspect = w / h;
                    heroCamera.updateProjectionMatrix();
                    heroRenderer.setSize(w, h);
                }
            });
        }

        function registerExplodedPart(obj, dx, dy, dz, rx = 0, ry = 0, rz = 0) {
            heroExplodedParts.push({
                obj: obj,
                basePos: obj.position.clone(),
                deltaPos: new THREE.Vector3(dx, dy, dz),
                baseRot: obj.rotation.clone(),
                deltaRot: new THREE.Euler(rx, ry, rz)
            });
        }

        let heroTorsoOuterMat = null;
        let heroFaceEyesGroup = null;
        let heroLeftEyeRing = null;
        let heroRightEyeRing = null;
        let heroSmileArc = null;
        let heroCoolingFanL = null;
        let heroCoolingFanR = null;
        let heroScreenMaterials = [];
        let heroChestLight = null;
        let heroVisorLight = null;

        // =====================================================================
        // SMOOTH FILLETED CAD GEOMETRY ENGINE (Exact 1,670mm / 1.67m Spec)
        // Ported directly from generate_cynobot_cad.py (S = 0.0014 -> 2.338u)
        // =====================================================================
        const CAD_SCALE = 0.0014;

        function cadAddTri(tris, p1, p2, p3) {
            tris.push([p1, p2, p3]);
        }

        function cadAddQuad(tris, p1, p2, p3, p4) {
            tris.push([p1, p2, p3]);
            tris.push([p1, p3, p4]);
        }

        function cadRoundedRectPointsXZ(cx, cz, sx, sz, r, nSeg = 5) {
            const hx = sx * 0.5;
            const hz = sz * 0.5;
            const rad = Math.min(r, hx * 0.48, hz * 0.48);
            if (rad <= 1e-6 || nSeg < 1) {
                return [
                    [cx - hx, cz - hz],
                    [cx + hx, cz - hz],
                    [cx + hx, cz + hz],
                    [cx - hx, cz + hz]
                ];
            }
            const corners = [
                [cx + hx - rad, cz + hz - rad, 0.0, Math.PI * 0.5],
                [cx - hx + rad, cz + hz - rad, Math.PI * 0.5, Math.PI],
                [cx - hx + rad, cz - hz + rad, Math.PI, Math.PI * 1.5],
                [cx + hx - rad, cz - hz + rad, Math.PI * 1.5, Math.PI * 2.0]
            ];
            const pts = [];
            for (let c = 0; c < corners.length; c++) {
                const [ox, oz, a0, a1] = corners[c];
                for (let i = 0; i <= nSeg; i++) {
                    const a = a0 + (a1 - a0) * (i / nSeg);
                    pts.push([ox + rad * Math.cos(a), oz + rad * Math.sin(a)]);
                }
            }
            return pts;
        }

        function cadRoundedRectPointsXY(cx, cy, sx, sy, r, nSeg = 6) {
            const hx = sx * 0.5;
            const hy = sy * 0.5;
            const rad = Math.min(r, hx * 0.49, hy * 0.49);
            const corners = [
                [cx + hx - rad, cy + hy - rad, 0.0, Math.PI * 0.5],
                [cx - hx + rad, cy + hy - rad, Math.PI * 0.5, Math.PI],
                [cx - hx + rad, cy - hy + rad, Math.PI, Math.PI * 1.5],
                [cx + hx - rad, cy - hy + rad, Math.PI * 1.5, Math.PI * 2.0]
            ];
            const pts = [];
            for (let c = 0; c < corners.length; c++) {
                const [ox, oy, a0, a1] = corners[c];
                for (let i = 0; i <= nSeg; i++) {
                    const a = a0 + (a1 - a0) * (i / nSeg);
                    pts.push([ox + rad * Math.cos(a), oy + rad * Math.sin(a)]);
                }
            }
            return pts;
        }

        function cadAddChamferedBoxY(tris, cx, y0, cz, sx, sy, sz, c = 6.0) {
            const y1 = y0 + sy;
            const ch = Math.min(c, sx * 0.22, sz * 0.22, sy * 0.22);
            const rCorner = Math.min(Math.max(ch * 1.35, 2.0), sx * 0.24, sz * 0.24);
            const rInner = Math.max(0.5, rCorner - ch);

            const ringOuter = cadRoundedRectPointsXZ(cx, cz, sx, sz, rCorner, 5);
            const ringInner = cadRoundedRectPointsXZ(cx, cz, sx - 2 * ch, sz - 2 * ch, rInner, 5);
            const n = ringOuter.length;

            const botInner = ringInner.map(([x, z]) => [x, y0, z]);
            const botOuter = ringOuter.map(([x, z]) => [x, y0 + ch, z]);
            const topOuter = ringOuter.map(([x, z]) => [x, y1 - ch, z]);
            const topInner = ringInner.map(([x, z]) => [x, y1, z]);

            const bc = [cx, y0, cz];
            const tc = [cx, y1, cz];
            for (let i = 0; i < n; i++) {
                const ni = (i + 1) % n;
                cadAddTri(tris, bc, botInner[i], botInner[ni]);
                cadAddQuad(tris, botInner[i], botOuter[i], botOuter[ni], botInner[ni]);
                cadAddQuad(tris, botOuter[i], topOuter[i], topOuter[ni], botOuter[ni]);
                cadAddQuad(tris, topOuter[i], topInner[i], topInner[ni], topOuter[ni]);
                cadAddTri(tris, tc, topInner[ni], topInner[i]);
            }
        }

        function cadAddBox(tris, cx, cy, cz, sx, sy, sz, bevel = null) {
            const m = Math.min(sx, sy, sz);
            const b = bevel !== null ? bevel : Math.min(4.0, m * 0.16);
            if (b > 0.25 && m > 2.5) {
                cadAddChamferedBoxY(tris, cx, cy - sy * 0.5, cz, sx, sy, sz, b);
            } else {
                const hx = sx * 0.5, hy = sy * 0.5, hz = sz * 0.5;
                const x0 = cx - hx, x1 = cx + hx;
                const y0 = cy - hy, y1 = cy + hy;
                const z0 = cz - hz, z1 = cz + hz;
                const v000 = [x0, y0, z0], v100 = [x1, y0, z0], v110 = [x1, y1, z0], v010 = [x0, y1, z0];
                const v001 = [x0, y0, z1], v101 = [x1, y0, z1], v111 = [x1, y1, z1], v011 = [x0, y1, z1];
                cadAddQuad(tris, v001, v101, v111, v011);
                cadAddQuad(tris, v100, v000, v010, v110);
                cadAddQuad(tris, v000, v001, v011, v010);
                cadAddQuad(tris, v101, v100, v110, v111);
                cadAddQuad(tris, v011, v111, v110, v010);
                cadAddQuad(tris, v000, v100, v101, v001);
            }
        }

        function cadAddRoundedRectPrismZ(tris, cx, cy, z0, sx, sy, sz, r, nSeg = 6, bevel = null) {
            const z1 = z0 + sz;
            const bev = bevel !== null ? bevel : Math.min(3.5, sz * 0.18, sx * 0.08, sy * 0.08);
            const ptsOuter = cadRoundedRectPointsXY(cx, cy, sx, sy, r, nSeg);
            const n = ptsOuter.length;

            if (bev > 0.25 && sz > 2.5) {
                const rIn = Math.max(0.5, r - bev);
                const ptsInner = cadRoundedRectPointsXY(cx, cy, sx - 2 * bev, sy - 2 * bev, rIn, nSeg);
                const cBack = [cx, cy, z0];
                const cFront = [cx, cy, z1];
                for (let i = 0; i < n; i++) {
                    const ni = (i + 1) % n;
                    const [xi0, yi0] = ptsInner[i];
                    const [xi1, yi1] = ptsInner[ni];
                    const [xo0, yo0] = ptsOuter[i];
                    const [xo1, yo1] = ptsOuter[ni];

                    const bi0 = [xi0, yi0, z0], bi1 = [xi1, yi1, z0];
                    const bo0 = [xo0, yo0, z0 + bev], bo1 = [xo1, yo1, z0 + bev];
                    const fo0 = [xo0, yo0, z1 - bev], fo1 = [xo1, yo1, z1 - bev];
                    const fi0 = [xi0, yi0, z1], fi1 = [xi1, yi1, z1];

                    cadAddTri(tris, cBack, bi1, bi0);
                    cadAddQuad(tris, bi0, bi1, bo1, bo0);
                    cadAddQuad(tris, bo0, bo1, fo1, fo0);
                    cadAddQuad(tris, fo0, fo1, fi1, fi0);
                    cadAddTri(tris, cFront, fi0, fi1);
                }
            } else {
                const cBack = [cx, cy, z0];
                const cFront = [cx, cy, z1];
                for (let i = 0; i < n; i++) {
                    const [x0, y0] = ptsOuter[i];
                    const [x1, y1] = ptsOuter[(i + 1) % n];
                    const b0 = [x0, y0, z0], b1 = [x1, y1, z0];
                    const f0 = [x0, y0, z1], f1 = [x1, y1, z1];
                    cadAddQuad(tris, b0, b1, f1, f0);
                    cadAddTri(tris, cFront, f0, f1);
                    cadAddTri(tris, cBack, b1, b0);
                }
            }
        }

        function cadAddCylinder(tris, cx, cy, cz, radius, length, axis = 'Y', segs = 24, bevel = null) {
            const half = length * 0.5;
            const bev = bevel !== null ? bevel : Math.min(2.2, radius * 0.14, length * 0.14);
            const rInner = Math.max(0.2, radius - bev);
            const ringsParams = (bev > 0.2 && length > 2.0 && radius > 1.5)
                ? [[-half, rInner], [-half + bev, radius], [half - bev, radius], [half, rInner]]
                : [[-half, radius], [half, radius]];

            function makePt(tPos, rVal, ang) {
                const c = rVal * Math.cos(ang);
                const s = rVal * Math.sin(ang);
                if (axis === 'Y') return [cx + c, cy + tPos, cz + s];
                if (axis === 'Z') return [cx + c, cy + s, cz + tPos];
                return [cx + tPos, cy + c, cz + s];
            }

            const rings = ringsParams.map(([tPos, rVal]) => {
                const ring = [];
                for (let i = 0; i < segs; i++) {
                    ring.push(makePt(tPos, rVal, (2.0 * Math.PI * i) / segs));
                }
                return ring;
            });

            const c0 = makePt(-half, 0.0, 0.0);
            const c1 = makePt(half, 0.0, 0.0);
            const firstRing = rings[0];
            const lastRing = rings[rings.length - 1];

            for (let i = 0; i < segs; i++) {
                const ni = (i + 1) % segs;
                for (let rIdx = 0; rIdx < rings.length - 1; rIdx++) {
                    const rA = rings[rIdx];
                    const rB = rings[rIdx + 1];
                    if (axis === 'Y') {
                        cadAddQuad(tris, rA[i], rB[i], rB[ni], rA[ni]);
                    } else {
                        cadAddQuad(tris, rA[i], rA[ni], rB[ni], rB[i]);
                    }
                }
                if (axis === 'Y') {
                    cadAddTri(tris, c1, lastRing[ni], lastRing[i]);
                    cadAddTri(tris, c0, firstRing[i], firstRing[ni]);
                } else {
                    cadAddTri(tris, c1, lastRing[i], lastRing[ni]);
                    cadAddTri(tris, c0, firstRing[ni], firstRing[i]);
                }
            }
        }

        function cadAddAnnulusZ(tris, cx, cy, z0, rInner, rOuter, thickness, segs = 32, theta0 = 0.0, theta1 = 2.0 * Math.PI) {
            const z1 = z0 + thickness;
            const fullCircle = Math.abs((theta1 - theta0) - 2.0 * Math.PI) < 1e-4;
            const count = fullCircle ? segs : segs + 1;
            const ptsInB = [], ptsOutB = [], ptsInF = [], ptsOutF = [];
            for (let i = 0; i < count; i++) {
                const t = theta0 + (theta1 - theta0) * (i / segs);
                const c = Math.cos(t), s = Math.sin(t);
                ptsInB.push([cx + rInner * c, cy + rInner * s, z0]);
                ptsOutB.push([cx + rOuter * c, cy + rOuter * s, z0]);
                ptsInF.push([cx + rInner * c, cy + rInner * s, z1]);
                ptsOutF.push([cx + rOuter * c, cy + rOuter * s, z1]);
            }
            for (let i = 0; i < segs; i++) {
                const ni = fullCircle ? (i + 1) % segs : i + 1;
                cadAddQuad(tris, ptsInF[i], ptsOutF[i], ptsOutF[ni], ptsInF[ni]);
                cadAddQuad(tris, ptsOutB[i], ptsInB[i], ptsInB[ni], ptsOutB[ni]);
                cadAddQuad(tris, ptsOutB[i], ptsOutB[ni], ptsOutF[ni], ptsOutF[i]);
                cadAddQuad(tris, ptsInF[i], ptsInF[ni], ptsInB[ni], ptsInB[i]);
            }
            if (!fullCircle) {
                cadAddQuad(tris, ptsInB[0], ptsOutB[0], ptsOutF[0], ptsInF[0]);
                cadAddQuad(tris, ptsOutB[segs], ptsInB[segs], ptsInF[segs], ptsOutF[segs]);
            }
        }

        function cadAddSquareTube(tris, x0, y0, z0, x1, y1, z1, size = 25.0) {
            const cx = (x0 + x1) * 0.5;
            const cy = (y0 + y1) * 0.5;
            const cz = (z0 + z1) * 0.5;
            const sx = Math.abs(x1 - x0) + size;
            const sy = Math.abs(y1 - y0) + size;
            const sz = Math.abs(z1 - z0) + size;
            cadAddBox(tris, cx, cy, cz, sx, sy, sz);
        }

        function buildCadMesh(tris, material, offsetY = 0, offsetX = 0, offsetZ = 0) {
            const nTris = tris.length;
            if (nTris === 0) return new THREE.Mesh();

            // 1. Compute centroid for outward-winding verification
            let cx = 0, cy = 0, cz = 0;
            const inv3N = 1.0 / (nTris * 3.0);
            for (let i = 0; i < nTris; i++) {
                const [v0, v1, v2] = tris[i];
                cx += (v0[0] + v1[0] + v2[0]) * inv3N;
                cy += (v0[1] + v1[1] + v2[1]) * inv3N;
                cz += (v0[2] + v1[2] + v2[2]) * inv3N;
            }

            // 2. Enforce outward triangle winding & compute face normals
            const fixedTris = new Array(nTris);
            const faceNormals = new Array(nTris);
            const vertMap = new Map();

            function vKey(v) {
                return Math.round(v[0] * 50) + ',' + Math.round(v[1] * 50) + ',' + Math.round(v[2] * 50);
            }

            for (let i = 0; i < nTris; i++) {
                let [v0, v1, v2] = tris[i];
                const ux = v1[0] - v0[0], uy = v1[1] - v0[1], uz = v1[2] - v0[2];
                const vx = v2[0] - v0[0], vy = v2[1] - v0[1], vz = v2[2] - v0[2];
                let nx = uy * vz - uz * vy;
                let ny = uz * vx - ux * vz;
                let nz = ux * vy - uy * vx;

                const mx = (v0[0] + v1[0] + v2[0]) / 3.0 - cx;
                const my = (v0[1] + v1[1] + v2[1]) / 3.0 - cy;
                const mz = (v0[2] + v1[2] + v2[2]) / 3.0 - cz;

                if (nx * mx + ny * my + nz * mz < 0.0) {
                    const tmp = v1; v1 = v2; v2 = tmp;
                    nx = -nx; ny = -ny; nz = -nz;
                }
                const len = Math.hypot(nx, ny, nz);
                if (len > 1e-12) {
                    nx /= len; ny /= len; nz /= len;
                } else {
                    nx = 0; ny = 1; nz = 0;
                }

                fixedTris[i] = [v0, v1, v2];
                faceNormals[i] = [nx, ny, nz];

                const keys = [vKey(v0), vKey(v1), vKey(v2)];
                for (let k = 0; k < 3; k++) {
                    let list = vertMap.get(keys[k]);
                    if (!list) {
                        list = [];
                        vertMap.set(keys[k], list);
                    }
                    list.push(i);
                }
            }

            // 3. Smooth vertex normals across faces with crease angle <= 52 deg
            const cosCrease = Math.cos((52.0 * Math.PI) / 180.0);
            const positions = new Float32Array(nTris * 9);
            const normals = new Float32Array(nTris * 9);

            for (let i = 0; i < nTris; i++) {
                const tri = fixedTris[i];
                const fn = faceNormals[i];
                for (let k = 0; k < 3; k++) {
                    const v = tri[k];
                    const adj = vertMap.get(vKey(v));
                    let sx = 0, sy = 0, sz = 0;
                    for (let a = 0; a < adj.length; a++) {
                        const an = faceNormals[adj[a]];
                        if (fn[0] * an[0] + fn[1] * an[1] + fn[2] * an[2] >= cosCrease) {
                            sx += an[0]; sy += an[1]; sz += an[2];
                        }
                    }
                    const sl = Math.hypot(sx, sy, sz);
                    if (sl > 1e-12) {
                        sx /= sl; sy /= sl; sz /= sl;
                    } else {
                        sx = fn[0]; sy = fn[1]; sz = fn[2];
                    }

                    const base = (i * 3 + k) * 3;
                    positions[base]     = (v[0] - offsetX) * CAD_SCALE;
                    positions[base + 1] = (v[1] - offsetY) * CAD_SCALE;
                    positions[base + 2] = (v[2] - offsetZ) * CAD_SCALE;
                    normals[base]       = sx;
                    normals[base + 1]   = sy;
                    normals[base + 2]   = sz;
                }
            }

            const geom = new THREE.BufferGeometry();
            geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
            const mesh = new THREE.Mesh(geom, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        }

        function buildHeroRobotModel(targetScene) {
            heroRobotRoot = new THREE.Group();
            if (targetScene) targetScene.add(heroRobotRoot); else if (heroScene) heroScene.add(heroRobotRoot);

            heroEyeMaterials = [];
            heroGlowMaterials = [];
            heroScreenMaterials = [];
            heroExplodedParts = [];

            const S = CAD_SCALE; // 0.0014 (1,670mm -> 2.338 Three.js units)

            // =================================================================
            // EXACT CAD WORKBENCH MATERIALS (Matching Cynobot Cad Design)
            // =================================================================
            const matWhite = new THREE.MeshStandardMaterial({
                color: 0xf4f7fb,
                roughness: 0.22,
                metalness: 0.08
            });

            // Torso outer shell material transitions smoothly to X-ray transparency during explosion
            heroTorsoOuterMat = new THREE.MeshStandardMaterial({
                color: 0xf4f7fb,
                roughness: 0.22,
                metalness: 0.08,
                transparent: true,
                opacity: 1.0
            });

            const matDark = new THREE.MeshStandardMaterial({
                color: 0x1e2430,
                roughness: 0.42,
                metalness: 0.48
            });

            const matSteel = new THREE.MeshStandardMaterial({
                color: 0x64748b,
                roughness: 0.32,
                metalness: 0.82
            });

            const matGlass = new THREE.MeshStandardMaterial({
                color: 0x050811,
                roughness: 0.08,
                metalness: 0.92
            });

            const matCyan = new THREE.MeshStandardMaterial({
                color: 0x00f0ff,
                emissive: 0x00d8ff,
                emissiveIntensity: 0.85,
                roughness: 0.15,
                metalness: 0.10
            });
            heroEyeMaterials.push(matCyan);
            heroGlowMaterials.push(matCyan);
            heroScreenMaterials.push(matCyan);

            const matMac = new THREE.MeshStandardMaterial({
                color: 0xdbe2ec,
                roughness: 0.20,
                metalness: 0.88
            });

            const matPcb = new THREE.MeshStandardMaterial({
                color: 0x106b38,
                roughness: 0.45,
                metalness: 0.25
            });

            // =================================================================
            // 00_WEIGHTED_BASE (Y: 0 -> 40mm, 520 x 440 x 40mm)
            // =================================================================
            heroBase = new THREE.Group();
            {
                const tDark = [], tSteel = [], tCyan = [];
                // Main lower dark steel base plate (Y: 0 -> 28mm) & upper step deck (Y: 28 -> 40mm)
                cadAddChamferedBoxY(tDark, 0.0, 0.0, 0.0, 520.0, 28.0, 440.0, 12.0);
                cadAddChamferedBoxY(tDark, 0.0, 28.0, 0.0, 450.0, 12.0, 360.0, 6.0);

                // 4 Corner circular leveling stabilizer pads (dia 68mm)
                [[-215.0, -175.0], [215.0, -175.0], [-215.0, 175.0], [215.0, 175.0]].forEach(([px, pz]) => {
                    cadAddCylinder(tDark, px, 6.0, pz, 34.0, 12.0, 'Y', 20);
                });

                // Rear power entry & emergency cut-off switch housing
                cadAddBox(tDark, 0.0, 23.0, -210.0, 96.0, 22.0, 24.0);

                // Dual leg mounting flange sockets & M8 anchor studs at X = +-105mm
                [-105.0, 105.0].forEach(lx => {
                    cadAddBox(tSteel, lx, 43.0, 10.0, 144.0, 10.0, 210.0);
                    [[-56.0, -75.0], [56.0, -75.0], [-56.0, 95.0], [56.0, 95.0]].forEach(([bx, bz]) => {
                        cadAddCylinder(tSteel, lx + bx, 51.0, bz, 5.0, 6.0, 'Y', 12);
                    });
                });

                // Front beveled cyan LED accent bar
                cadAddBox(tCyan, 0.0, 18.0, 221.0, 310.0, 8.0, 6.0);

                heroBase.add(buildCadMesh(tDark, matDark));
                heroBase.add(buildCadMesh(tSteel, matSteel));
                heroBase.add(buildCadMesh(tCyan, matCyan));
            }
            heroRobotRoot.add(heroBase);
            registerExplodedPart(heroBase, 0, -160.0 * S, 0);

            // =================================================================
            // 05 & 06_LEG_ASSEMBLIES + LOWER 07_INTERNAL_STEEL_SKELETON (Y: 40 -> 805mm)
            // =================================================================
            heroLegs = new THREE.Group();
            {
                // Lower Internal 25x25mm RHS Steel Skeleton (Leg columns, foot bars, knee/hip gussets)
                const tLegSteel = [];
                [-105.0, 105.0].forEach(lx => {
                    cadAddSquareTube(tLegSteel, lx, 40.0, 0.0, lx, 830.0, 0.0, 25.0);
                    cadAddSquareTube(tLegSteel, lx, 52.0, -70.0, lx, 52.0, 110.0, 25.0);
                    cadAddBox(tLegSteel, lx, 148.0, 0.0, 48.0, 44.0, 48.0);
                    cadAddBox(tLegSteel, lx, 486.0, 0.0, 52.0, 56.0, 52.0);
                    cadAddBox(tLegSteel, lx, 805.0, 0.0, 60.0, 20.0, 60.0);
                });
                heroLegs.add(buildCadMesh(tLegSteel, matSteel));

                // Left Leg (X = +105mm, side = +1) & Right Leg (X = -105mm, side = -1)
                [1, -1].forEach(side => {
                    const lx = 105.0 * side;
                    const legGroup = new THREE.Group();

                    // A. Foot & Ankle Sub-Assembly (Y: 40 -> 175mm)
                    const tFootWhite = [], tFootDark = [], tFootCyan = [];
                    cadAddChamferedBoxY(tFootDark, lx, 40.0, 24.0, 152.0, 22.0, 248.0, 8.0);
                    cadAddChamferedBoxY(tFootWhite, lx, 62.0, 20.0, 146.0, 50.0, 236.0, 14.0);
                    cadAddChamferedBoxY(tFootWhite, lx, 112.0, 6.0, 134.0, 23.0, 158.0, 6.0);
                    cadAddBox(tFootDark, lx, 75.0, 137.0, 84.0, 18.0, 8.0);
                    cadAddBox(tFootCyan, lx, 55.0, 147.0, 72.0, 6.0, 4.0);
                    cadAddCylinder(tFootDark, lx, 148.0, 0.0, 38.0, 126.0, 'X', 24);
                    cadAddCylinder(tFootDark, lx + side * 65.0, 148.0, 0.0, 26.0, 8.0, 'X', 20);
                    legGroup.add(buildCadMesh(tFootWhite, matWhite));
                    legGroup.add(buildCadMesh(tFootDark, matDark));
                    legGroup.add(buildCadMesh(tFootCyan, matCyan));

                    // B. Shin Outer Armor Shell Group (Y: 175 -> 461mm) - Shifts outward during explosion to reveal steel column
                    const shinShellGroup = new THREE.Group();
                    const tShinWhite = [], tShinDark = [], tShinCyan = [];
                    cadAddChamferedBoxY(tShinWhite, lx, 175.0, 4.0, 132.0, 286.0, 142.0, 16.0);
                    cadAddBox(tShinDark, lx, 318.0, -64.0, 74.0, 250.0, 18.0);
                    cadAddBox(tShinDark, lx, 190.0, 73.0, 68.0, 20.0, 10.0);
                    cadAddBox(tShinDark, lx, 446.0, 73.0, 68.0, 20.0, 10.0);
                    cadAddBox(tShinCyan, lx - 36.0, 318.0, 75.5, 8.0, 220.0, 4.0);
                    cadAddBox(tShinCyan, lx + 36.0, 318.0, 75.5, 8.0, 220.0, 4.0);
                    shinShellGroup.add(buildCadMesh(tShinWhite, matWhite));
                    shinShellGroup.add(buildCadMesh(tShinDark, matDark));
                    shinShellGroup.add(buildCadMesh(tShinCyan, matCyan));
                    legGroup.add(shinShellGroup);
                    registerExplodedPart(shinShellGroup, side * 55.0 * S, 0, 28.0 * S);

                    // C. Knee Joint Cylinder & Cyan Ring (Y: 486mm)
                    const tKneeDark = [], tKneeCyan = [];
                    cadAddCylinder(tKneeDark, lx, 486.0, 0.0, 46.0, 136.0, 'X', 28);
                    cadAddCylinder(tKneeDark, lx - 70.0, 486.0, 0.0, 34.0, 8.0, 'X', 20);
                    cadAddCylinder(tKneeDark, lx + 70.0, 486.0, 0.0, 34.0, 8.0, 'X', 20);
                    cadAddCylinder(tKneeCyan, lx + side * 74.5, 486.0, 0.0, 26.0, 3.0, 'X', 24);
                    legGroup.add(buildCadMesh(tKneeDark, matDark));
                    legGroup.add(buildCadMesh(tKneeCyan, matCyan));

                    // D. Thigh Outer Armor Shell Group (Y: 511 -> 805mm) - Shifts outward during explosion
                    const thighShellGroup = new THREE.Group();
                    const tThighWhite = [], tThighDark = [], tThighCyan = [], tThighSteel = [];
                    cadAddChamferedBoxY(tThighWhite, lx, 511.0, 4.0, 140.0, 281.0, 150.0, 18.0);
                    cadAddBox(tThighDark, lx, 651.5, -68.0, 78.0, 245.0, 18.0);
                    cadAddBox(tThighDark, lx, 526.0, 77.0, 74.0, 20.0, 10.0);
                    cadAddBox(tThighDark, lx, 777.0, 77.0, 74.0, 20.0, 10.0);
                    cadAddBox(tThighCyan, lx - 38.0, 651.5, 79.5, 8.0, 215.0, 4.0);
                    cadAddBox(tThighCyan, lx + 38.0, 651.5, 79.5, 8.0, 215.0, 4.0);
                    cadAddBox(tThighSteel, lx, 798.5, 4.0, 128.0, 13.0, 136.0);
                    thighShellGroup.add(buildCadMesh(tThighWhite, matWhite));
                    thighShellGroup.add(buildCadMesh(tThighDark, matDark));
                    thighShellGroup.add(buildCadMesh(tThighCyan, matCyan));
                    thighShellGroup.add(buildCadMesh(tThighSteel, matSteel));
                    legGroup.add(thighShellGroup);
                    registerExplodedPart(thighShellGroup, side * 55.0 * S, 0, 28.0 * S);

                    heroLegs.add(legGroup);
                    registerExplodedPart(legGroup, side * 130.0 * S, -60.0 * S, 0);
                });
            }
            heroRobotRoot.add(heroLegs);

            // =================================================================
            // PELVIS & WAIST CORE (Y: 805 -> 915mm)
            // =================================================================
            heroPelvis = new THREE.Group();
            {
                const tPelvisSteel = [], tPelvisDark = [], tPelvisCyan = [];
                // Pelvis steel crossbars & central spine riser
                cadAddSquareTube(tPelvisSteel, -135.0, 830.0, 0.0, 135.0, 830.0, 0.0, 25.0);
                cadAddSquareTube(tPelvisSteel, -135.0, 900.0, 0.0, 135.0, 900.0, 0.0, 25.0);
                cadAddSquareTube(tPelvisSteel, 0.0, 830.0, 0.0, 0.0, 915.0, 0.0, 25.0);
                // Dark pelvis joiner & waist transition block
                cadAddChamferedBoxY(tPelvisDark, 0.0, 805.0, 4.0, 110.0, 60.0, 152.0, 10.0);
                cadAddChamferedBoxY(tPelvisDark, 0.0, 860.0, 2.0, 324.0, 55.0, 198.0, 14.0);
                cadAddCylinder(tPelvisDark, 0.0, 835.0, 4.0, 42.0, 290.0, 'X', 24);
                cadAddBox(tPelvisCyan, 0.0, 888.0, 100.0, 180.0, 8.0, 6.0);

                heroPelvis.add(buildCadMesh(tPelvisSteel, matSteel));
                heroPelvis.add(buildCadMesh(tPelvisDark, matDark));
                heroPelvis.add(buildCadMesh(tPelvisCyan, matCyan));
            }
            heroRobotRoot.add(heroPelvis);

            // =================================================================
            // 02_TORSO_OUTER_SHELL + UPPER 07_SKELETON + 08_HARDWARE_BAY
            // Pivoted at Y = 915mm (915 * S = 1.281) for natural torso tilt
            // =================================================================
            const TORSO_PIVOT_Y = 915.0;
            heroTorso = new THREE.Group();
            heroTorso.position.set(0, TORSO_PIVOT_Y * S, 0);

            // 1. Upper Internal 25x25mm RHS Steel Skeleton Cage (Y: 900 -> 1535mm)
            {
                const tTorsoSteel = [];
                [[-135.0, -70.0], [135.0, -70.0], [-135.0, 70.0], [135.0, 70.0]].forEach(([tx, tz]) => {
                    cadAddSquareTube(tTorsoSteel, tx, 900.0, tz, tx, 1380.0, tz, 25.0);
                });
                [940.0, 1120.0, 1270.0, 1380.0].forEach(ry => {
                    cadAddSquareTube(tTorsoSteel, -135.0, ry, -70.0, 135.0, ry, -70.0, 25.0);
                    cadAddSquareTube(tTorsoSteel, -135.0, ry, 70.0, 135.0, ry, 70.0, 25.0);
                    cadAddSquareTube(tTorsoSteel, -135.0, ry, -70.0, -135.0, ry, 70.0, 25.0);
                    cadAddSquareTube(tTorsoSteel, 135.0, ry, -70.0, 135.0, ry, 70.0, 25.0);
                });
                // Heavy shoulder actuator crossbar & neck mast
                cadAddSquareTube(tTorsoSteel, -245.0, 1320.0, 0.0, 245.0, 1320.0, 0.0, 25.0);
                cadAddSquareTube(tTorsoSteel, 0.0, 1380.0, 0.0, 0.0, 1535.0, 0.0, 25.0);
                cadAddBox(tTorsoSteel, 0.0, 1535.0, 0.0, 120.0, 10.0, 110.0);
                heroTorso.add(buildCadMesh(tTorsoSteel, matSteel, TORSO_PIVOT_Y));
            }

            // 2. 08_INTERNAL_HARDWARE_BAY (Mac mini M1, ESP32 PCB, PDU/UPS, Dual 80mm Fans)
            {
                const internalHwGroup = new THREE.Group();
                const tHwSteel = [], tHwMac = [], tHwDark = [], tHwPcb = [], tHwCyan = [];

                // Internal Steel Shelf & Rubber Isolators for Mac mini M1
                cadAddBox(tHwSteel, 0.0, 1126.0, -5.0, 236.0, 6.0, 210.0);
                [[-80.0, -80.0], [80.0, -80.0], [-80.0, 70.0], [80.0, 70.0]].forEach(([mx, mz]) => {
                    cadAddCylinder(tHwDark, mx, 1160.0, mz, 8.0, 14.0, 'Y', 12);
                });

                // Exact Apple Mac mini (M1) Compute Core (197 x 197 x 36mm, R22mm) at Y: 1167..1203mm
                const macPts = cadRoundedRectPointsXZ(0.0, -5.0, 197.0, 197.0, 22.0, 6);
                const macY0 = 1167.0, macY1 = 1203.0, nM = macPts.length;
                for (let i = 0; i < nM; i++) {
                    const [x0, z0] = macPts[i];
                    const [x1, z1] = macPts[(i + 1) % nM];
                    const b0 = [x0, macY0, z0], b1 = [x1, macY0, z1];
                    const t0 = [x0, macY1, z0], t1 = [x1, macY1, z1];
                    cadAddQuad(tHwMac, b0, t0, t1, b1);
                    cadAddTri(tHwMac, [0.0, macY1, -5.0], t1, t0);
                    cadAddTri(tHwMac, [0.0, macY0, -5.0], b0, b1);
                }
                // Top circular dark Apple logo emblem on Mac mini M1 & rear I/O strip
                cadAddCylinder(tHwDark, 0.0, 1203.8, -5.0, 23.0, 1.6, 'Y', 24);
                cadAddBox(tHwDark, 0.0, 1185.0, -103.5, 140.0, 18.0, 4.0);

                // Power Distribution Unit (PDU) & 24V/12V/5V UPS Module (Y: 946..1014mm)
                cadAddChamferedBoxY(tHwDark, 0.0, 946.0, -5.0, 210.0, 68.0, 120.0, 8.0);
                cadAddBox(tHwCyan, 0.0, 980.0, 56.0, 150.0, 8.0, 4.0);

                // ESP32 Motor & Sensor Carrier PCB (Y: 1301..1309mm)
                cadAddBox(tHwPcb, 0.0, 1305.0, -5.0, 150.0, 8.0, 85.0);
                cadAddBox(tHwDark, -36.0, 1311.0, -5.0, 28.0, 4.0, 34.0);
                cadAddBox(tHwDark, 36.0, 1311.0, -5.0, 28.0, 4.0, 34.0);
                cadAddBox(tHwCyan, 0.0, 1311.0, 30.0, 40.0, 4.0, 6.0);

                // Dual 80mm Rear Exhaust Cooling Fans (X = +-55mm, Y = 1060mm, Z = -58mm)
                [-55.0, 55.0].forEach(fx => {
                    cadAddRoundedRectPrismZ(tHwDark, fx, 1060.0, -70.5, 80.0, 80.0, 25.0, 8.0, 4);
                    cadAddCylinder(tHwDark, fx, 1060.0, -58.0, 34.0, 27.0, 'Z', 24);
                    cadAddAnnulusZ(tHwCyan, fx, 1060.0, -72.0, 31.0, 35.0, 3.0, 24);
                });

                internalHwGroup.add(buildCadMesh(tHwSteel, matSteel, TORSO_PIVOT_Y));
                internalHwGroup.add(buildCadMesh(tHwMac, matMac, TORSO_PIVOT_Y));
                internalHwGroup.add(buildCadMesh(tHwDark, matDark, TORSO_PIVOT_Y));
                internalHwGroup.add(buildCadMesh(tHwPcb, matPcb, TORSO_PIVOT_Y));
                internalHwGroup.add(buildCadMesh(tHwCyan, matCyan, TORSO_PIVOT_Y));

                heroTorso.add(internalHwGroup); internalHwGroup.userData.partKey = 'brain';
                registerExplodedPart(internalHwGroup, 0, 0, 95.0 * S);
            }

            // 3. 02_TORSO_OUTER_SHELL (Main White Shell, Trim, Neck Column, Kiosk Screen, Rear Hatch)
            {
                const tShellWhite = [], tShellDark = [], tShellCyan = [];
                // Main sculpted white torso armor (Y: 915..1405mm, 368 x 490 x 244mm) + collar bridge
                cadAddChamferedBoxY(tShellWhite, 0.0, 915.0, 0.0, 368.0, 490.0, 244.0, 30.0);
                cadAddChamferedBoxY(tShellWhite, 0.0, 1405.0, 0.0, 320.0, 22.0, 200.0, 8.0);

                // Side vertical cyan LED accent strips & 4 corner fastener pockets
                [-173.5, 173.5].forEach(sx => {
                    cadAddBox(tShellCyan, sx, 1160.0, 108.0, 6.0, 400.0, 8.0);
                });
                [[-156.0, 955.0], [156.0, 955.0], [-156.0, 1365.0], [156.0, 1365.0]].forEach(([bx, by]) => {
                    cadAddCylinder(tShellDark, bx, by, 120.0, 6.0, 6.0, 'Z', 14);
                });

                // Shoulder mounting bosses at X = +-188mm, Y = 1320mm
                [-188.0, 188.0].forEach(sx => {
                    cadAddCylinder(tShellDark, sx, 1320.0, 0.0, 48.0, 20.0, 'X', 24);
                });

                // Cylindrical Neck Column (Y: 1405 -> 1460mm, dia 116mm) + glowing cyan collar ring
                cadAddCylinder(tShellDark, 0.0, 1432.5, 0.0, 58.0, 55.0, 'Y', 28);
                cadAddCylinder(tShellCyan, 0.0, 1436.0, 0.0, 60.0, 8.0, 'Y', 28);

                heroTorso.add(buildCadMesh(tShellWhite, heroTorsoOuterMat, TORSO_PIVOT_Y));
                heroTorso.add(buildCadMesh(tShellDark, matDark, TORSO_PIVOT_Y));
                heroTorso.add(buildCadMesh(tShellCyan, matCyan, TORSO_PIVOT_Y));

                // Front 10" Chest Touchscreen Kiosk Group (Explodes Forward +Z)
                const chestDisplayGroup = new THREE.Group();
                const tKioskDark = [], tKioskGlass = [], tKioskCyan = [];
                cadAddRoundedRectPrismZ(tKioskDark, 0.0, 1165.0, 112.0, 244.0, 284.0, 12.0, 18.0, 6);
                cadAddRoundedRectPrismZ(tKioskGlass, 0.0, 1165.0, 118.5, 222.0, 262.0, 6.0, 14.0, 6);

                // Glowing Cyan "AI" Emblem & Status Bar on Chest Display (Exact CAD Geometry)
                const aiZ = 127.5;
                // Pure White CYNOCOR Wolf Logo Emblem on Chest Display
                const wolfTex = new THREE.TextureLoader().load(_cynoWolfLogoDataUri);
                const wolfMat = new THREE.MeshBasicMaterial({ map: wolfTex, transparent: true, opacity: 0.96, depthWrite: false });
                const wolfMesh = new THREE.Mesh(new THREE.PlaneGeometry(162.0 * S, 162.0 * S), wolfMat);
                wolfMesh.position.set(0, (1176.0 - TORSO_PIVOT_Y) * S, 126.8 * S); chestDisplayGroup.add(wolfMesh);
                cadAddBox(tKioskCyan, 0.0, 1085.0, aiZ, 150.0, 6.0, 4.0);

                chestDisplayGroup.add(buildCadMesh(tKioskDark, matDark, TORSO_PIVOT_Y));
                chestDisplayGroup.add(buildCadMesh(tKioskGlass, matGlass, TORSO_PIVOT_Y));
                chestDisplayGroup.add(buildCadMesh(tKioskCyan, matCyan, TORSO_PIVOT_Y));
                heroTorso.add(chestDisplayGroup);
                registerExplodedPart(chestDisplayGroup, 0, 15.0 * S, 260.0 * S);

                // Rear Removable Maintenance Louver Hatch (Explodes Backward -Z)
                const rearHatchGroup = new THREE.Group();
                const tHatchWhite = [], tHatchDark = [];
                cadAddRoundedRectPrismZ(tHatchWhite, 0.0, 1160.0, -126.0, 260.0, 360.0, 10.0, 16.0, 5);
                for (let slotIdx = 0; slotIdx < 12; slotIdx++) {
                    const ly = 1020.0 + slotIdx * 24.0;
                    cadAddBox(tHatchDark, 0.0, ly, -124.5, 180.0, 6.0, 6.0);
                }
                rearHatchGroup.add(buildCadMesh(tHatchWhite, matWhite, TORSO_PIVOT_Y));
                rearHatchGroup.add(buildCadMesh(tHatchDark, matDark, TORSO_PIVOT_Y));
                heroTorso.add(rearHatchGroup);
                registerExplodedPart(rearHatchGroup, 0, 0, -210.0 * S);
            }

            // =================================================================
            // 03_LEFT_ARM_ASSEMBLY (X = +238mm, Shoulder Pivot at Y = 1320mm)
            // =================================================================
            const SHOULDER_Y = 1320.0;
            const ARM_X = 238.0;
            heroLeftArm = new THREE.Group();
            heroLeftArm.position.set(ARM_X * S, (SHOULDER_Y - TORSO_PIVOT_Y) * S, 0);
            {
                const s = 1.0;
                const ax = ARM_X * s;
                const tArmWhite = [], tArmDark = [], tArmCyan = [];

                // 1. Shoulder Joint & Upper Arm (Bicep)
                cadAddCylinder(tArmDark, s * 216.0, 1320.0, 0.0, 44.0, 56.0, 'X', 24);
                cadAddChamferedBoxY(tArmWhite, ax, 1265.0, 0.0, 96.0, 120.0, 118.0, 16.0);
                cadAddBox(tArmCyan, ax, 1387.0, 0.0, 68.0, 6.0, 44.0);
                cadAddChamferedBoxY(tArmWhite, ax, 1070.0, 0.0, 88.0, 175.0, 104.0, 14.0);
                cadAddBox(tArmDark, ax, 1215.0, 0.0, 92.0, 24.0, 108.0);

                // 2. Elbow Joint (Y = 1036mm)
                cadAddCylinder(tArmDark, ax, 1036.0, 0.0, 37.0, 96.0, 'X', 24);
                cadAddCylinder(tArmCyan, ax + s * 49.0, 1036.0, 0.0, 24.0, 4.0, 'X', 20);

                // 3. Forearm Shell (Y: 782 -> 1004mm)
                cadAddChamferedBoxY(tArmWhite, ax, 782.0, 0.0, 84.0, 222.0, 98.0, 14.0);
                cadAddBox(tArmCyan, ax + s * 43.0, 893.0, 0.0, 4.0, 165.0, 10.0);
                cadAddBox(tArmCyan, ax, 893.0, 50.0, 8.0, 165.0, 4.0);

                // 4. Wrist Joint & Articulated Hand (Y: 645 -> 782mm)
                cadAddCylinder(tArmDark, ax, 768.0, 0.0, 29.0, 28.0, 'Y', 20);
                cadAddChamferedBoxY(tArmDark, ax, 691.0, 0.0, 52.0, 63.0, 76.0, 8.0);
                cadAddBox(tArmWhite, ax + s * 24.0, 722.0, 0.0, 10.0, 52.0, 64.0);
                // Thumb
                cadAddBox(tArmDark, ax - s * 14.0, 706.0, 44.0, 16.0, 28.0, 16.0);
                cadAddBox(tArmDark, ax - s * 14.0, 684.0, 48.0, 14.0, 22.0, 14.0);
                // 4 Articulated Fingers
                [-24.0, -8.0, 8.0, 24.0].forEach(fz => {
                    cadAddBox(tArmDark, ax, 677.0, fz, 16.0, 26.0, 12.0);
                    cadAddCylinder(tArmDark, ax, 663.0, fz, 6.5, 16.0, 'Z', 12);
                    cadAddBox(tArmDark, ax, 653.5, fz, 14.0, 17.0, 11.0);
                });

                heroLeftArm.add(buildCadMesh(tArmWhite, matWhite, SHOULDER_Y, ax, 0));
                heroLeftArm.add(buildCadMesh(tArmDark, matDark, SHOULDER_Y, ax, 0));
                heroLeftArm.add(buildCadMesh(tArmCyan, matCyan, SHOULDER_Y, ax, 0));
            }
            heroTorso.add(heroLeftArm);
            registerExplodedPart(heroLeftArm, 195.0 * S, 25.0 * S, 0);

            // =================================================================
            // 04_RIGHT_ARM_ASSEMBLY (X = -238mm, Rigged Shoulder & Elbow Wave Pivot)
            // =================================================================
            const ELBOW_Y = 1036.0;
            heroRightArmPivot = new THREE.Group();
            heroRightArmPivot.position.set(-ARM_X * S, (SHOULDER_Y - TORSO_PIVOT_Y) * S, 0);
            heroRightArm = new THREE.Group();
            {
                const s = -1.0;
                const ax = ARM_X * s; // -238.0
                const tUpperWhite = [], tUpperDark = [], tUpperCyan = [];

                // 1. Shoulder Joint, Bicep & Elbow Barrel (Relative to Shoulder Pivot at (-238, 1320, 0))
                cadAddCylinder(tUpperDark, s * 216.0, 1320.0, 0.0, 44.0, 56.0, 'X', 24);
                cadAddChamferedBoxY(tUpperWhite, ax, 1265.0, 0.0, 96.0, 120.0, 118.0, 16.0);
                cadAddBox(tUpperCyan, ax, 1387.0, 0.0, 68.0, 6.0, 44.0);
                cadAddChamferedBoxY(tUpperWhite, ax, 1070.0, 0.0, 88.0, 175.0, 104.0, 14.0);
                cadAddBox(tUpperDark, ax, 1215.0, 0.0, 92.0, 24.0, 108.0);
                cadAddCylinder(tUpperDark, ax, 1036.0, 0.0, 37.0, 96.0, 'X', 24);
                cadAddCylinder(tUpperCyan, ax + s * 49.0, 1036.0, 0.0, 24.0, 4.0, 'X', 20);

                heroRightArm.add(buildCadMesh(tUpperWhite, matWhite, SHOULDER_Y, ax, 0));
                heroRightArm.add(buildCadMesh(tUpperDark, matDark, SHOULDER_Y, ax, 0));
                heroRightArm.add(buildCadMesh(tUpperCyan, matCyan, SHOULDER_Y, ax, 0));

                // 2. Forearm & Hand Rigged at Elbow Pivot (Y = 1036mm) for Wave Gesture
                heroRightForearmPivot = new THREE.Group();
                heroRightForearmPivot.position.set(0, (ELBOW_Y - SHOULDER_Y) * S, 0);

                const tForeWhite = [], tForeDark = [], tForeCyan = [];
                cadAddChamferedBoxY(tForeWhite, ax, 782.0, 0.0, 84.0, 222.0, 98.0, 14.0);
                cadAddBox(tForeCyan, ax + s * 43.0, 893.0, 0.0, 4.0, 165.0, 10.0);
                cadAddBox(tForeCyan, ax, 893.0, 50.0, 8.0, 165.0, 4.0);
                cadAddCylinder(tForeDark, ax, 768.0, 0.0, 29.0, 28.0, 'Y', 20);
                cadAddChamferedBoxY(tForeDark, ax, 691.0, 0.0, 52.0, 63.0, 76.0, 8.0);
                cadAddBox(tForeWhite, ax + s * 24.0, 722.0, 0.0, 10.0, 52.0, 64.0);
                // Thumb
                cadAddBox(tForeDark, ax - s * 14.0, 706.0, 44.0, 16.0, 28.0, 16.0);
                cadAddBox(tForeDark, ax - s * 14.0, 684.0, 48.0, 14.0, 22.0, 14.0);
                // 4 Articulated Fingers
                [-24.0, -8.0, 8.0, 24.0].forEach(fz => {
                    cadAddBox(tForeDark, ax, 677.0, fz, 16.0, 26.0, 12.0);
                    cadAddCylinder(tForeDark, ax, 663.0, fz, 6.5, 16.0, 'Z', 12);
                    cadAddBox(tForeDark, ax, 653.5, fz, 14.0, 17.0, 11.0);
                });

                heroRightForearmPivot.add(buildCadMesh(tForeWhite, matWhite, ELBOW_Y, ax, 0));
                heroRightForearmPivot.add(buildCadMesh(tForeDark, matDark, ELBOW_Y, ax, 0));
                heroRightForearmPivot.add(buildCadMesh(tForeCyan, matCyan, ELBOW_Y, ax, 0));

                heroRightArm.add(heroRightForearmPivot);
                heroRightArmPivot.add(heroRightArm);
            }
            heroTorso.add(heroRightArmPivot);
            registerExplodedPart(heroRightArmPivot, -195.0 * S, 25.0 * S, 0);

            // =================================================================
            // 01_HEAD_ASSEMBLY (Y: 1460 -> 1670mm, 276 x 210 x 196mm, R36mm)
            // Pivoted at Y = 1460mm for smooth real-time cursor head tracking
            // =================================================================
            const HEAD_PIVOT_Y = 1460.0;
            heroHead = new THREE.Group();
            heroHead.position.set(0, (HEAD_PIVOT_Y - TORSO_PIVOT_Y) * S, 0);
            {
                const cy = 1565.0; // Center of 210mm tall head (1460..1670mm)

                // 1. Main Sculpted White Rounded-Rectangle Head Casing (276 x 210 x 196mm, R36mm)
                const tHeadWhite = [], tHeadPcb = [], tHeadInternalDark = [];
                cadAddRoundedRectPrismZ(tHeadWhite, 0.0, cy, -98.0, 276.0, 210.0, 196.0, 36.0, 8);
                // Internal Head Sensor & Display Driver PCB (visible when faceplate explodes)
                cadAddBox(tHeadPcb, 0.0, 1565.0, 20.0, 160.0, 90.0, 6.0);
                cadAddBox(tHeadInternalDark, 0.0, 1565.0, 26.0, 36.0, 36.0, 6.0);
                heroHead.add(buildCadMesh(tHeadWhite, matWhite, HEAD_PIVOT_Y));
                heroHead.add(buildCadMesh(tHeadPcb, matPcb, HEAD_PIVOT_Y));
                heroHead.add(buildCadMesh(tHeadInternalDark, matDark, HEAD_PIVOT_Y));

                // 2. Front Recessed Bezel, Black OLED Glass & Animated 3D Cyan Eyes/Smile (Explodes Forward +Z)
                const headVisorGroup = new THREE.Group();
                const tVisorDark = [], tVisorGlass = [], tVisorBorder = [];
                cadAddRoundedRectPrismZ(tVisorDark, 0.0, cy, 90.0, 244.0, 178.0, 12.0, 28.0, 6);
                cadAddRoundedRectPrismZ(tVisorGlass, 0.0, cy, 98.0, 228.0, 162.0, 6.0, 24.0, 6);

                // Inner Cyan LED Screen Frame Border (184 x 118mm)
                const fz = 104.0;
                cadAddBox(tVisorBorder, 0.0, cy + 59.0, fz + 1.0, 184.0, 3.5, 2.0);
                cadAddBox(tVisorBorder, 0.0, cy - 59.0, fz + 1.0, 184.0, 3.5, 2.0);
                cadAddBox(tVisorBorder, -92.0, cy, fz + 1.0, 3.5, 118.0, 2.0);
                cadAddBox(tVisorBorder, 92.0, cy, fz + 1.0, 3.5, 118.0, 2.0);

                headVisorGroup.add(buildCadMesh(tVisorDark, matDark, HEAD_PIVOT_Y));
                headVisorGroup.add(buildCadMesh(tVisorGlass, matGlass, HEAD_PIVOT_Y));
                headVisorGroup.add(buildCadMesh(tVisorBorder, matCyan, HEAD_PIVOT_Y));

                // Interactive 3D Cyan Eye Rings & Smile Arc (Tracks Mouse Gaze & Blinks!)
                heroFaceEyesGroup = new THREE.Group();
                const EYE_Y = cy + 7.0; // 1572mm
                const tEyeL = [], tEyeR = [], tSmile = [];
                cadAddAnnulusZ(tEyeL, -52.0, EYE_Y, fz, 17.0, 26.0, 3.0, 32);
                cadAddAnnulusZ(tEyeR, 52.0, EYE_Y, fz, 17.0, 26.0, 3.0, 32);
                cadAddAnnulusZ(
                    tSmile,
                    0.0,
                    cy - 23.0,
                    fz,
                    14.0,
                    18.5,
                    3.0,
                    24,
                    (200.0 * Math.PI) / 180.0,
                    (340.0 * Math.PI) / 180.0
                );

                // Pivot each eye ring at its own center so vertical blink scaling is centered on the eye
                heroLeftEyeRing = buildCadMesh(tEyeL, matCyan, EYE_Y, -52.0, 0);
                heroLeftEyeRing.position.set(-52.0 * S, (EYE_Y - HEAD_PIVOT_Y) * S, 0);
                heroFaceEyesGroup.add(heroLeftEyeRing);

                heroRightEyeRing = buildCadMesh(tEyeR, matCyan, EYE_Y, 52.0, 0);
                heroRightEyeRing.position.set(52.0 * S, (EYE_Y - HEAD_PIVOT_Y) * S, 0);
                heroFaceEyesGroup.add(heroRightEyeRing);

                const SMILE_Y = cy - 23.0;
                heroSmileArc = buildCadMesh(tSmile, matCyan, SMILE_Y, 0, 0);
                heroSmileArc.position.set(0, (SMILE_Y - HEAD_PIVOT_Y) * S, 0);
                heroFaceEyesGroup.add(heroSmileArc);

                headVisorGroup.add(heroFaceEyesGroup);
                heroHead.add(headVisorGroup);
                registerExplodedPart(headVisorGroup, 0, 10.0 * S, 210.0 * S);

                // 3. Top Optical Camera & ToF Sensor Bar (Y = 1656mm, Explodes Upward +Y)
                const topSensorGroup = new THREE.Group();
                const tTopDark = [], tTopCyan = [], tTopGlass = [];
                cadAddBox(tTopDark, 0.0, cy + 91.0, 84.0, 136.0, 16.0, 44.0);
                cadAddCylinder(tTopDark, 0.0, cy + 91.0, 106.0, 10.0, 6.0, 'Z', 20);
                cadAddCylinder(tTopCyan, 0.0, cy + 91.0, 108.0, 6.0, 4.0, 'Z', 16);
                [-38.0, 38.0].forEach(tx => {
                    cadAddCylinder(tTopGlass, tx, cy + 91.0, 106.0, 7.0, 5.0, 'Z', 16);
                });
                topSensorGroup.add(buildCadMesh(tTopDark, matDark, HEAD_PIVOT_Y));
                topSensorGroup.add(buildCadMesh(tTopCyan, matCyan, HEAD_PIVOT_Y));
                topSensorGroup.add(buildCadMesh(tTopGlass, matGlass, HEAD_PIVOT_Y));
                heroHead.add(topSensorGroup);
                registerExplodedPart(topSensorGroup, 0, 85.0 * S, 0);

                // 4. Dual Side Circular Speaker / Microphone Pods (X = +-142mm, dia 112mm, Explode Outward +-X)
                [-1, 1].forEach(side => {
                    const earGroup = new THREE.Group();
                    const tEarDark = [], tEarCyan = [];
                    const ex = side * 142.0;
                    cadAddCylinder(tEarDark, ex, cy, 0.0, 56.0, 24.0, 'X', 28);
                    cadAddCylinder(tEarCyan, side * 153.0, cy, 0.0, 44.0, 4.0, 'X', 28);
                    cadAddCylinder(tEarDark, side * 154.5, cy, 0.0, 34.0, 4.0, 'X', 24);
                    earGroup.add(buildCadMesh(tEarDark, matDark, HEAD_PIVOT_Y));
                    earGroup.add(buildCadMesh(tEarCyan, matCyan, HEAD_PIVOT_Y));
                    heroHead.add(earGroup);
                    registerExplodedPart(earGroup, side * 145.0 * S, 0, 0);
                });
            }
            heroTorso.add(heroHead);
            registerExplodedPart(heroHead, 0, 115.0 * S, 0);

            heroRobotRoot.add(heroTorso);
            if (typeof shellMaterials !== 'undefined' && heroTorsoOuterMat) shellMaterials.push(heroTorsoOuterMat);
            const _tagPart = (grp, k) => { if (grp) grp.traverse(c => { if (c.isMesh && !c.userData.partKey) c.userData.partKey = k; }); };
            _tagPart(heroBase, 'legs'); _tagPart(heroLegs, 'legs'); _tagPart(heroPelvis, 'legs');
            _tagPart(heroHead, 'head'); _tagPart(heroLeftArm, 'leftArm'); _tagPart(heroRightArmPivot, 'rightArm'); _tagPart(heroTorso, 'torso');
            heroTorso.traverse(c => { if (c.parent && c.parent.userData && c.parent.userData.partKey === 'brain' && c.isMesh) c.userData.partKey = 'brain'; });
        }

        function setupHeroMouseInteractions(container) {
            // Track cursor position globally across screen for fluid head & gaze tracking
            window.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const normX = (e.clientX - centerX) / (window.innerWidth / 2);
                const normY = (e.clientY - centerY) / (window.innerHeight / 2);

                heroMouse.targetX = THREE.MathUtils.clamp(normX, -1.2, 1.2);
                heroMouse.targetY = THREE.MathUtils.clamp(normY, -1.0, 1.0);
                window._heroLastMouseMove = performance.now();
            });

            // Mouse Drag to Orbit Robot in 3D
            container.addEventListener('mousedown', (e) => {
                heroIsDragging = true;
                heroPrevMouseX = e.clientX;
            });

            window.addEventListener('mousemove', (e) => {
                if (heroIsDragging) {
                    const delta = e.clientX - heroPrevMouseX;
                    heroPrevMouseX = e.clientX;
                    heroTargetRotationY += delta * 0.014;
                }
            });

            window.addEventListener('mouseup', () => {
                heroIsDragging = false;
            });

            // Mobile Touch Support
            container.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    heroIsDragging = true;
                    heroPrevMouseX = e.touches[0].clientX;
                }
            }, { passive: true });

            window.addEventListener('touchmove', (e) => {
                if (heroIsDragging && e.touches.length === 1) {
                    const delta = e.touches[0].clientX - heroPrevMouseX;
                    heroPrevMouseX = e.touches[0].clientX;
                    heroTargetRotationY += delta * 0.016;
                }
            }, { passive: true });

            window.addEventListener('touchend', () => {
                heroIsDragging = false;
            });
        }

        /***********************************************************************
         * FULL-SCREEN SCROLL-DRIVEN 3D CAD EXPLOSION, INSPECTION & HERO DOCKING
         ***********************************************************************/
        let isIntroActive = false;
        let isIntroDocking = false;
        let introProgress = 0.0;
        let introTargetProgress = 0.0;

        // Smooth Mouse Wheel & Touch scrubbing during Full-Screen Intro
        window.addEventListener('wheel', (e) => {
            if (isIntroActive) {
                e.preventDefault();
                introTargetProgress += e.deltaY * 0.00075;
                introTargetProgress = THREE.MathUtils.clamp(introTargetProgress, 0.0, 1.0);
                if (introTargetProgress >= 0.96 && !isIntroDocking) {
                    dockIntoWebsite();
                }
            }
        }, { passive: false });

        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            if (isIntroActive && e.touches.length === 1) {
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (isIntroActive && e.touches.length === 1) {
                if (e.cancelable) e.preventDefault();
                const dy = touchStartY - e.touches[0].clientY;
                touchStartY = e.touches[0].clientY;
                introTargetProgress += dy * 0.0035;
                introTargetProgress = THREE.MathUtils.clamp(introTargetProgress, 0.0, 1.0);
                if (introTargetProgress >= 0.96 && !isIntroDocking) {
                    dockIntoWebsite();
                }
            }
        }, { passive: false });

        function dockIntoWebsite() {
            if (isIntroDocking) return;
            isIntroDocking = true;
            introTargetProgress = 1.0;

            setTimeout(() => {
                document.body.classList.remove('intro-active');
                document.body.classList.add('intro-settled');

                // Continuously resize Three.js viewport over the 1.2s docking transition
                const startT = performance.now();
                function glideResize() {
                    onWindowResize();
                    if (performance.now() - startT < 1400) {
                        requestAnimationFrame(glideResize);
                    } else {
                        isIntroActive = false;
                        isIntroDocking = false;
                        onWindowResize();
                    }
                }
                requestAnimationFrame(glideResize);
            }, 200);
        }

        function skipIntro() {
            if (!isIntroActive) return;
            introTargetProgress = 1.0;
            dockIntoWebsite();
        }

        function scrollToOverview(e) {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            if (isIntroActive) {
                skipIntro();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Hero entrance: time-based spring so it plays the same at 60 Hz and 120 Hz.
        const HERO_INTRO = { start: null, waved: false };
        function heroIntroSeconds() {
            return HERO_INTRO.start === null ? 99 : (performance.now() - HERO_INTRO.start) / 1000;
        }
        // Damped spring 0 -> 1 with a small overshoot (about 6%).
        function heroSpring(t, k = 5.2, w = 6.4) {
            if (t <= 0) return 0;
            return 1 - Math.exp(-k * t) * Math.cos(w * t);
        }
        function heroEaseInOut(t) {
            t = Math.min(1, Math.max(0, t));
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function renderHeroRobot(elapsed) {
            if (!heroRobotRoot || !heroHead || !heroTorso || !heroCamera) return;

            const isMobile = window.innerWidth < 768 || (heroCamera.aspect < 1.0);
            const introCamZ = isMobile ? 5.8 : 4.8;
            const introCamY = 1.25;
            const introLookY = 1.22;

            let targetExplode = 0;
            const camTargetPos = new THREE.Vector3(0, introCamY, introCamZ);
            const camTargetLook = new THREE.Vector3(0, introLookY, 0);
            let activeCardId = null;
            let badgePhase = "3D CAD SIMULATION";
            let badgeDetail = "MODULAR ARCHITECTURE";

            if (isIntroActive) {
                // Silky smooth inertial lerp driven by the user's mouse scroll rhythm
                introProgress += (introTargetProgress - introProgress) * 0.085;
                const p = introProgress;

                // Multi-Stage Choreography matching reference CAD image
                if (p < 0.18) {
                    // Phase 1: CAD Explosion (0% -> 100%)
                    const t = p / 0.18;
                    targetExplode = t;
                    camTargetPos.set(0, introCamY, introCamZ);
                    camTargetLook.set(0, introLookY, 0);
                    badgePhase = "CAD SIMULATION";
                    badgeDetail = `EXPLODED VIEW (${Math.round(t * 100)}%)`;
                } else if (p < 0.38) {
                    // Phase 2: Head & Sensors Close-up Zoom (01_head_assembly)
                    const t = (p - 0.18) / 0.20;
                    targetExplode = 1.0;
                    camTargetPos.lerpVectors(new THREE.Vector3(0, introCamY, introCamZ), new THREE.Vector3(0, 2.34, isMobile ? 2.40 : 1.90), t);
                    camTargetLook.lerpVectors(new THREE.Vector3(0, introLookY, 0), new THREE.Vector3(0, 2.30, 0.15), t);
                    activeCardId = 'hud-card-head';
                    badgePhase = "01_HEAD_ASSEMBLY";
                    badgeDetail = "276x210x196MM • R36 FILLETED";
                } else if (p < 0.58) {
                    // Phase 3: Torso & Apple Mac mini M1 Close-up Zoom (02_torso + 08_hardware_bay)
                    const t = (p - 0.38) / 0.20;
                    targetExplode = 1.0;
                    camTargetPos.lerpVectors(new THREE.Vector3(0, 2.34, isMobile ? 2.40 : 1.90), new THREE.Vector3(0, 1.65, isMobile ? 2.15 : 1.65), t);
                    camTargetLook.lerpVectors(new THREE.Vector3(0, 2.30, 0.15), new THREE.Vector3(0, 1.62, 0.15), t);
                    activeCardId = 'hud-card-torso';
                    badgePhase = "08_INTERNAL_HARDWARE_BAY";
                    badgeDetail = "MAC MINI M1 • ESP32 • DUAL FANS";
                } else if (p < 0.72) {
                    // Phase 4: Legs & Weighted Base Close-up Zoom (05/06_legs + 07_steel_skeleton + 00_base)
                    const t = (p - 0.58) / 0.14;
                    targetExplode = 1.0;
                    camTargetPos.lerpVectors(new THREE.Vector3(0, 1.65, isMobile ? 2.15 : 1.65), new THREE.Vector3(0, 0.68, isMobile ? 2.65 : 2.15), t);
                    camTargetLook.lerpVectors(new THREE.Vector3(0, 1.62, 0.15), new THREE.Vector3(0, 0.55, 0.0), t);
                    activeCardId = 'hud-card-legs';
                    badgePhase = "07_STEEL_SKELETON & BASE";
                    badgeDetail = "25x25MM RHS • 520x440MM BASE";
                } else if (p < 0.86) {
                    // Phase 5: Zoom Out & Magnetically Re-Assemble
                    const t = (p - 0.72) / 0.14;
                    targetExplode = 1.0 - t;
                    camTargetPos.lerpVectors(new THREE.Vector3(0, 0.68, isMobile ? 2.65 : 2.15), new THREE.Vector3(0, introCamY, introCamZ), t);
                    camTargetLook.lerpVectors(new THREE.Vector3(0, 0.55, 0.0), new THREE.Vector3(0, introLookY, 0), t);
                    activeCardId = 'hud-card-assembled';
                    badgePhase = "RE-ASSEMBLING CHASSIS";
                    badgeDetail = `DOCKING MODULES (${Math.round((1 - t) * 100)}%)`;
                } else {
                    // Phase 6: Hero Keynote Docking & Placement
                    const t = (p - 0.86) / 0.14;
                    targetExplode = 0.0;
                    camTargetPos.lerpVectors(new THREE.Vector3(0, introCamY, introCamZ), new THREE.Vector3(0, 1.20, isMobile ? 4.1 : 3.65), t);
                    camTargetLook.lerpVectors(new THREE.Vector3(0, introLookY, 0), new THREE.Vector3(0, 1.15, 0), t);
                    badgePhase = "ENTERING SHOWCASE";
                    badgeDetail = "DOCKING TO KEYNOTE";
                }

                updateScrollyUI(p, badgePhase, badgeDetail, activeCardId);
            } else {
                // Settled inside website hero section - perfectly framed full robot view
                targetExplode = 0;
                const introS = heroIntroSeconds();
                const zFrom = isMobile ? 4.6 : 3.2, zTo = isMobile ? 3.75 : 2.28;
                const introZ = zFrom + (zTo - zFrom) * heroEaseInOut((introS - 0.15) / 2.1);
                camTargetPos.set(0, 1.72, introZ);
                camTargetLook.set(0, 1.72, 0);
            }

            // Smooth Camera Interpolation
            heroCamera.position.lerp(camTargetPos, 0.055);
            heroCamCurrentLookAt.lerp(camTargetLook, 0.055);
            heroCamera.lookAt(heroCamCurrentLookAt);

            // Smooth Exploded Parts Motion
            heroExplodeAmount += (targetExplode - heroExplodeAmount) * 0.12;
            heroExplodedParts.forEach(part => {
                part.obj.position.lerpVectors(
                    part.basePos,
                    part.basePos.clone().add(part.deltaPos),
                    heroExplodeAmount
                );
                if (part.deltaRot) {
                    part.obj.rotation.x = part.baseRot.x + part.deltaRot.x * heroExplodeAmount;
                    part.obj.rotation.y = part.baseRot.y + part.deltaRot.y * heroExplodeAmount;
                    part.obj.rotation.z = part.baseRot.z + part.deltaRot.z * heroExplodeAmount;
                }
            });

            // X-Ray Torso Outer Shell Transparency during CAD Explosion so Mac mini M1 & Steel Frame are visible
            if (heroTorsoOuterMat) {
                heroTorsoOuterMat.opacity = 1.0 - heroExplodeAmount * 0.78;
                heroTorsoOuterMat.depthWrite = heroExplodeAmount < 0.08;
            }

            // Natural Head & Torso Tracking Mouse Movement
            const idleSecs = (performance.now() - (window._heroLastMouseMove || 0)) * 0.001;
            const autoBlend = THREE.MathUtils.clamp((idleSecs - 1.0) / 1.2, 0.0, 1.0);
            const autoLookX = Math.sin(elapsed * 1.15) * 0.65 + Math.sin(elapsed * 0.45) * 0.25;
            const autoLookY = Math.sin(elapsed * 0.8 + 1.1) * 0.18 + Math.cos(elapsed * 1.5) * 0.08;
            const desiredX = THREE.MathUtils.lerp(heroMouse.targetX, autoLookX, autoBlend);
            const desiredY = THREE.MathUtils.lerp(heroMouse.targetY, autoLookY, autoBlend);
            heroMouse.x += (desiredX - heroMouse.x) * 0.07;
            heroMouse.y += (desiredY - heroMouse.y) * 0.07;

            const introSec = heroIntroSeconds();
            const rise = heroSpring(introSec);
            const lookIn = THREE.MathUtils.clamp((introSec - 0.9) / 0.8, 0, 1);
            const headLift = heroSpring(introSec - 0.45, 6.0, 7.0);

            heroHead.rotation.y = heroMouse.x * 0.45 * lookIn;
            heroHead.rotation.x = heroMouse.y * 0.45 * lookIn + (1 - headLift) * 0.5;
            heroHead.rotation.z = -heroMouse.x * 0.05 * lookIn;

            heroTorso.rotation.y = heroMouse.x * 0.18 * lookIn;
            heroTorso.rotation.x = heroMouse.y * 0.15 * lookIn;

            // Interactive 3D CAD Eye Ring Gaze Offset, Blinking & Speaking Smile Pulse
            if (heroFaceEyesGroup) {
                heroFaceEyesGroup.position.x = heroMouse.x * 0.018;
                heroFaceEyesGroup.position.y = -heroMouse.y * 0.012;
            }
            if (heroLeftEyeRing && heroRightEyeRing) {
                let blinkScaleY = (typeof state !== 'undefined' && state.isBlinking) ? 0.12 : 1.0;
                if (introSec < 0.8) blinkScaleY = 0.04;
                else if (introSec > 1.25 && introSec < 1.37) blinkScaleY = 0.12;
                heroLeftEyeRing.scale.y += (blinkScaleY - heroLeftEyeRing.scale.y) * 0.35;
                heroRightEyeRing.scale.y += (blinkScaleY - heroRightEyeRing.scale.y) * 0.35;
            }
            if (heroSmileArc) {
                const speakScaleY = heroSpeaking ? (1.0 + Math.abs(Math.sin(elapsed * 16)) * 0.65) : 1.0;
                heroSmileArc.scale.y = speakScaleY;
            }

            // Idle Breathing Motion
            heroRobotRoot.position.y = Math.sin(elapsed * 2.2) * 0.014 - (1 - rise) * 1.35;
            if (!HERO_INTRO.waved && introSec > 1.55 && introSec < 20) {
                HERO_INTRO.waved = true;
                heroWave.active = true;
                heroWave.time = 0;
            }

            // User Orbit Drag Interpolation
            heroRotationY += (heroTargetRotationY - heroRotationY) * 0.1;
            heroRobotRoot.rotation.y = heroRotationY - (1 - rise) * 0.55;

            // Interactive Arm Wave Animation
            if (heroWave.active && heroRightArmPivot && heroRightForearmPivot) {
                heroWave.time += 0.024;
                const t = heroWave.time;

                if (t < heroWave.duration) {
                    const raiseProgress = Math.min(1, t * 2.4);
                    const easeRaise = Math.sin(raiseProgress * Math.PI / 2);
                    // Shoulder lifts upper arm up & slightly forward
                    heroRightArmPivot.rotation.z = -easeRaise * 1.15;
                    heroRightArmPivot.rotation.x = easeRaise * 0.40;
                    heroRightArmPivot.rotation.y = -easeRaise * 0.20;

                    // Elbow bends forearm upward into wave pose
                    heroRightForearmPivot.rotation.z = -easeRaise * 1.45;
                    // Forearm waves back and forth left-right
                    heroRightForearmPivot.rotation.y = Math.sin(t * 14) * 0.42;

                    // Head tilts pleasantly toward the waving hand
                    heroHead.rotation.z = easeRaise * 0.10;
                    heroHead.rotation.y = -easeRaise * 0.16;
                } else {
                    // Smooth return to resting stance
                    heroRightArmPivot.rotation.z *= 0.86;
                    heroRightArmPivot.rotation.x *= 0.86;
                    heroRightArmPivot.rotation.y *= 0.86;
                    heroRightForearmPivot.rotation.z *= 0.86;
                    heroRightForearmPivot.rotation.y *= 0.86;

                    if (Math.abs(heroRightArmPivot.rotation.z) < 0.02) {
                        heroRightArmPivot.rotation.set(0, 0, 0);
                        heroRightForearmPivot.rotation.set(0, 0, 0);
                        heroWave.active = false;
                    }
                }
            }

            // Speaking Head Motion Animation
            if (heroSpeaking && heroHead) {
                heroHead.rotation.x += Math.sin(elapsed * 12) * 0.035;
            }
        }

        function updateScrollyUI(p, badgePhase, badgeDetail, activeCardId) {
            // Scrub meter
            const fill = document.getElementById('scrolly-progress-fill');
            const pctText = document.getElementById('scrolly-progress-pct');
            if (fill) fill.style.width = `${Math.round(p * 100)}%`;
            if (pctText) pctText.textContent = `${Math.round(p * 100)}%`;

            // Phase badges
            const bPhase = document.getElementById('scrolly-badge-phase');
            const bDetail = document.getElementById('scrolly-badge-detail');
            if (bPhase) bPhase.textContent = badgePhase;
            if (bDetail) bDetail.textContent = badgeDetail;

            // HUD Cards active state
            const cardIds = ['hud-card-head', 'hud-card-torso', 'hud-card-legs', 'hud-card-assembled'];
            cardIds.forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                if (id === activeCardId) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });
        }

        // Interactive Feature 1: Trigger Wave Hand Animation
        function triggerHeroWave() {
            heroWave.active = true;
            heroWave.time = 0;

            // Welcoming robotic double chime
            playCyberBeep(587, 'sine', 0.08);
            setTimeout(() => playCyberBeep(880, 'sine', 0.12), 80);

            // Button active state feedback
            const waveBtn = document.getElementById('btn-hero-wave');
            if (waveBtn) {
                waveBtn.classList.add('border-cyan-400', 'bg-cyan-500/25', 'text-cyan-200');
                const waveSpan = waveBtn.querySelector('span');
                if (waveSpan) waveSpan.textContent = 'Waving...';
                setTimeout(() => {
                    waveBtn.classList.remove('border-cyan-400', 'bg-cyan-500/25', 'text-cyan-200');
                    if (waveSpan) waveSpan.textContent = 'Wave Hand';
                }, heroWave.duration * 1000);
            }

            const bubble = document.getElementById('hero-speech-text');
            if (bubble) {
                bubble.textContent = '👋 "Hello! Welcome to CYNOCOR! I am CYNO BOT."';
            }

            if (!state.voiceMuted && 'speechSynthesis' in window) {
                try {
                    window.speechSynthesis.resume();
                    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance('Hello! Welcome to CYNO BOT 3D interactive showcase.');
                    window._cynoSpeechUtterance = u;
                    u.rate = 1.05;
                    u.pitch = 1.15;
                    u.onend = () => { window._cynoSpeechUtterance = null; };
                    u.onerror = () => { window._cynoSpeechUtterance = null; };
                    setTimeout(() => {
                        try {
                            window.speechSynthesis.resume();
                            window.speechSynthesis.speak(u);
                        } catch (e) {}
                    }, 40);
                } catch (e) {}
            }
        }

        // Interactive Feature 2: Cycle Sensor Glow Colors & Moods
        function cycleHeroMood() {
            heroMoodIndex = (heroMoodIndex + 1) % HERO_MOODS.length;
            const mood = HERO_MOODS[heroMoodIndex];

            // 1. Update 3D Robot Sensor Materials
            heroEyeMaterials.forEach(mat => {
                if (mat && mat.color) mat.color.setHex(mood.hex);
            });
            heroGlowMaterials.forEach(mat => {
                if (mat && mat.color) mat.color.setHex(mood.hex);
            });

            // 2. Update 10" Chest Kiosk Display & Visor Faceplate Emissive Mood Color
            heroScreenMaterials.forEach(mat => {
                if (mat && mat.emissive) mat.emissive.setHex(mood.hex);
                if (mat && mat.color) mat.color.setHex(mood.hex);
            });

            // 3. Update 3D Stage & Ambient Accent Lights
            if (heroRimLight) heroRimLight.color.setHex(mood.hex);
            if (heroFloorLight) heroFloorLight.color.setHex(mood.hex);
            if (heroChestLight) heroChestLight.color.setHex(mood.hex);
            if (heroVisorLight) heroVisorLight.color.setHex(mood.hex);

            // 4. Update HTML Floor Glow Radial Gradient Div
            const floorEl = document.getElementById('hero-floor-light');
            if (floorEl) {
                floorEl.style.background = `radial-gradient(ellipse at center, ${mood.cssColor}66 0%, ${mood.cssColor}25 45%, transparent 75%)`;
            }

            // 5. Update Quick Chip Button Feedback
            const moodBtn = document.getElementById('btn-hero-mood');
            if (moodBtn) {
                moodBtn.style.borderColor = mood.cssColor;
                moodBtn.style.color = '#ffffff';
                moodBtn.style.backgroundColor = `${mood.cssColor}33`;
                moodBtn.style.boxShadow = `0 0 16px ${mood.cssColor}60`;
                const moodIcon = moodBtn.querySelector('i');
                if (moodIcon) moodIcon.style.color = mood.cssColor;
                const moodSpan = moodBtn.querySelector('span');
                if (moodSpan) moodSpan.textContent = mood.name;
            }

            // 6. Update Speech Bubble & Glowing Pulse Dot
            const bubble = document.getElementById('hero-speech-text');
            if (bubble) {
                bubble.textContent = '✨ Mode: ' + mood.name + ' — ' + mood.text;
            }
            const bubbleDot = document.querySelector('#hero-speech-bubble span:first-child');
            if (bubbleDot) bubbleDot.style.backgroundColor = mood.cssColor;

            // 7. Play pleasant dual-pitch mode-switch synth chime
            playCyberBeep(mood.soundFreq || 580, 'sine', 0.16, 0.12);
            setTimeout(() => {
                playCyberBeep((mood.soundFreq || 580) * 1.25, 'sine', 0.12, 0.08);
            }, 90);
        }

        // Interactive Feature 3: Trigger Voice Greeting
        function triggerHeroVoice() {
            const speechList = [
                "Greetings! I am CYNO BOT, powered by Apple Mac mini M1 neural brain.",
                "Hello! I'm here to help visitors at reception.",
                "Group G 40 robotics platform online. Whisper STT and Ollama local LLM active.",
                "Welcome to IIT Campus! I am equipped with real-time gaze tracking and touchscreen kiosk."
            ];
            const chosen = speechList[Math.floor(Math.random() * speechList.length)];

            if (state) state.voiceMuted = false;
            heroSpeaking = true;

            // 1. Dual-tone robotic activation chime (Immediate Web Audio API feedback)
            const voiceNotes = [440, 554, 659, 880, 659];
            voiceNotes.forEach((freq, idx) => {
                setTimeout(() => {
                    playCyberBeep(freq, 'sine', 0.07, 0.09);
                }, idx * 60);
            });

            // 2. Update Speech Bubble
            const bubble = document.getElementById('hero-speech-text');
            if (bubble) {
                bubble.textContent = '🔊 "' + chosen + '"';
            }

            // 3. Button active visual feedback
            const voiceBtn = document.getElementById('btn-hero-voice');
            if (voiceBtn) {
                voiceBtn.classList.add('border-blue-400', 'bg-blue-500/25', 'text-blue-200');
                const voiceSpan = voiceBtn.querySelector('span');
                if (voiceSpan) voiceSpan.textContent = 'Speaking...';
                setTimeout(() => {
                    voiceBtn.classList.remove('border-blue-400', 'bg-blue-500/25', 'text-blue-200');
                    if (voiceSpan) voiceSpan.textContent = 'Voice Speech';
                }, 3800);
            }

            // 4. Web Speech Synthesis with Chromium GC protection and resume()
            if ('speechSynthesis' in window) {
                try {
                    window.speechSynthesis.resume();
                    if (window.speechSynthesis.speaking) {
                        window.speechSynthesis.cancel();
                    }

                    const u = new SpeechSynthesisUtterance(chosen);
                    window._cynoSpeechUtterance = u; // Keep reference to prevent GC

                    u.rate = 1.02;
                    u.pitch = 1.10;

                    const voices = window.speechSynthesis.getVoices();
                    if (voices && voices.length > 0) {
                        const enVoice = voices.find(v => v.lang && v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('David') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('English'))) || voices.find(v => v.lang && v.lang.startsWith('en'));
                        if (enVoice) u.voice = enVoice;
                    }

                    u.onstart = () => {
                        heroSpeaking = true;
                    };
                    u.onend = () => {
                        heroSpeaking = false;
                        window._cynoSpeechUtterance = null;
                    };
                    u.onerror = () => {
                        heroSpeaking = false;
                        window._cynoSpeechUtterance = null;
                    };

                    setTimeout(() => {
                        try {
                            window.speechSynthesis.resume();
                            window.speechSynthesis.speak(u);
                        } catch (e) {
                            heroSpeaking = false;
                        }
                    }, 50);
                } catch (e) {
                    heroSpeaking = false;
                }
            } else {
                setTimeout(() => {
                    heroSpeaking = false;
                }, 3500);
            }
        }

        // Interactive Feature 4: Reset 3D View Angle & Orbit
        function resetHeroBotRotation() {
            heroTargetRotationY = 0;
            heroRotationY = 0;
            heroMouse.targetX = 0;
            heroMouse.targetY = 0;
            heroMouse.x = 0;
            heroMouse.y = 0;
            heroSpeaking = false;

            if (heroWave) {
                heroWave.active = false;
                heroWave.time = 0;
            }
            if (heroRightArmPivot) heroRightArmPivot.rotation.set(0, 0, 0);
            if (heroRightForearmPivot) heroRightForearmPivot.rotation.set(0, 0, 0);

            // Play soft mechanical click tone
            playCyberBeep(380, 'triangle', 0.08);

            // Animate 360-degree rotation of reset icon
            const resetBtn = document.getElementById('btn-hero-reset');
            if (resetBtn) {
                const icon = resetBtn.querySelector('i');
                if (icon) {
                    icon.style.transform = 'rotate(-360deg)';
                    icon.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
                    setTimeout(() => {
                        icon.style.transition = '';
                        icon.style.transform = '';
                    }, 500);
                }
            }

            const bubble = document.getElementById('hero-speech-text');
            if (bubble) {
                bubble.textContent = '🔄 Re-centered to front view. Move cursor to interact!';
            }
        }

        function bindHeroActionButtons() {
            const waveBtn = document.getElementById('btn-hero-wave');
            if (waveBtn) {
                waveBtn.onclick = (e) => { e.preventDefault(); triggerHeroWave(); };
            }
            const moodBtn = document.getElementById('btn-hero-mood');
            if (moodBtn) {
                moodBtn.onclick = (e) => { e.preventDefault(); cycleHeroMood(); };
            }
            const voiceBtn = document.getElementById('btn-hero-voice');
            if (voiceBtn) {
                voiceBtn.onclick = (e) => { e.preventDefault(); triggerHeroVoice(); };
            }
            const resetBtn = document.getElementById('btn-hero-reset');
            if (resetBtn) {
                resetBtn.onclick = (e) => { e.preventDefault(); resetHeroBotRotation(); };
            }
        }

        // Global exports to guarantee window availability for HTML onclick handlers
        window.triggerHeroWave = triggerHeroWave;
        window.cycleHeroMood = cycleHeroMood;
        window.triggerHeroVoice = triggerHeroVoice;
        window.resetHeroBotRotation = resetHeroBotRotation;
        window.bindHeroActionButtons = bindHeroActionButtons;

        // Wave Animation Alias for Studio and Hero
        window.triggerWaveAnimation = function() {
            if (typeof triggerHeroWave === 'function') {
                triggerHeroWave();
            } else if (typeof playCyberBeep === 'function') {
                playCyberBeep(700, 'sine', 0.2);
            }
        };

        // Interactive Voice AI Query Simulator
        // Scripted demo answers. They only use facts stated elsewhere on the page.
        const DEMO_ANSWERS = [
            { match: ['about yourself', 'who are you'], text: "I'm CYNO BOT, a 1.67 m receptionist robot built by Cynocor, Group G 40 at IIT Sri Lanka. I greet visitors, answer questions and show information on my chest screen." },
            { match: ['tall', 'height'], text: "I'm 1.67 m tall, so I can talk to most visitors at eye level. I stand on a 520 × 440 mm anti-tip steel base." },
            { match: ['brain', 'computer', 'run'], text: "An Apple Mac mini (M1) in my torso. It runs Whisper for speech recognition and a local Ollama language model, and idles at about 7 W." },
            { match: ['module leader', 'supervis', 'leader'], text: "The ATP module leader supervising this project is Mr. Bhanu Athuraliya at the Informatics Institute of Technology." },
            { match: ['room', 'direction', 'find', 'where'], text: "On the robot, directions come from the university's own information, shown on this screen with a QR code you can scan. This web demo doesn't include campus data." },
            { match: ['event', 'today'], text: "On the robot I answer from the university's own information. This web demo doesn't have live event data." },
            { match: ['use you', 'how do i use', 'how to use'], text: "Just walk up and talk to me, or tap my chest screen. I listen, then answer out loud." },
            { match: ['module', 'detach', 'transport'], text: "I come apart into six modules: head, torso, two arms, legs and base. It takes under 3 minutes without tools." }
        ];

        function simulateVoiceQuery(query) {
            const chatLog = document.getElementById('chat-log');
            if (!chatLog) return;

            appendChatLog('VISITOR', query, false);
            if (typeof playCyberBeep === 'function') playCyberBeep(520, 'sine', 0.1, 0.05);

            const q = query.toLowerCase();
            const hit = DEMO_ANSWERS.find(a => a.match.some(m => q.includes(m)));
            const responseText = hit ? hit.text
                : "This web demo only knows a few things about me. On the real robot, questions go to the speech and language models running on the Mac mini.";

            const thinkingEl = document.createElement('div');
            thinkingEl.className = 'chat-row';
            thinkingEl.innerHTML = '<span class="chat-avatar">CB</span><span class="chat-thinking" aria-label="Thinking"><i></i><i></i><i></i></span>';
            chatLog.appendChild(thinkingEl);
            chatLog.scrollTop = chatLog.scrollHeight;

            setTimeout(() => {
                thinkingEl.remove();
                appendChatLog('CYNO BOT', responseText, true);
                if (typeof speakRobotText === 'function') speakRobotText(responseText);
            }, 700);
        }

        window.simulateVoiceQuery = simulateVoiceQuery;

        function toggleMobileMenu() {
            const drawer = document.getElementById('mobile-menu-drawer');
            if (drawer) drawer.classList.toggle('hidden');
        }
        window.toggleMobileMenu = toggleMobileMenu;



        /***********************************************************************
         * 12. APPLE-STYLE NAVBAR SCROLLSPY & DYNAMIC SCROLL TRANSITION
         ***********************************************************************/
        function setupNavbarScrollSpy() {
            const sectionIds = ['cynobot', 'pillars', 'specs', 'greeting-flow', 'kiosk-simulator', 'architecture', 'fabrication', 'team'];
            const links = Array.from(document.querySelectorAll('.nav-spy-link'));
            if (!links.length) return;

            function onScroll() {
                const scrollY = window.scrollY;

                const navWrapper = document.getElementById('main-nav-wrapper');
                if (navWrapper) {
                    if (scrollY > 24) {
                        navWrapper.classList.add('nav-floating', 'nav-visible'); navWrapper.classList.remove('nav-hidden-top');
                    } else {
                        navWrapper.classList.remove('nav-floating', 'nav-visible'); navWrapper.classList.add('nav-hidden-top'); const d = document.getElementById('mobile-menu-drawer'); if (d) d.classList.add('hidden');
                    }
                }

                // Scrollspy active section detection
                const checkY = scrollY + 180;
                let currentId = 'cynobot';

                for (const id of sectionIds) {
                    const el = document.getElementById(id);
                    if (el) {
                        const top = el.offsetTop;
                        const height = el.offsetHeight;
                        if (checkY >= top && checkY < top + height) {
                            currentId = id;
                            break;
                        }
                    }
                }

                links.forEach(link => {
                    const target = link.getAttribute('data-nav-id');
                    if (target === currentId) {
                        link.className = 'nav-spy-link is-active px-3.5 py-1.5 rounded-full transition-all duration-200';
                    } else {
                        link.className = 'nav-spy-link px-3.5 py-1.5 rounded-full transition-all duration-200';
                    }
                });
            }

            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }

        /***********************************************************************
         * APPLICATION INITIALIZATION & RUNNER
         ***********************************************************************/
        let appInitialized = false;
        let animationRunning = false;

        function updateKioskClock() {
            const clockEl = document.getElementById('kiosk-clock');
            if (!clockEl) return;
            const now = new Date();
            clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        function startApp() {
            if (appInitialized) return;

            appInitialized = true;
            isIntroActive = false;
            isIntroDocking = false;
            introProgress = 1.0;
            introTargetProgress = 1.0;
            document.body.classList.remove('intro-active');
            document.body.classList.add('intro-settled');

            if (document.getElementById('robot-canvas-container')) {
                initThreeJS();
            }

            if (document.getElementById('kiosk-dynamic-screen')) {
                selectOperatingMode('entrance');
            }

            updateKioskClock();
            setInterval(updateKioskClock, 15000);

            if (document.getElementById('budget-rows')) {
                setBudgetTier('low');
            }

            if (document.getElementById('hero-robot-canvas-container')) {
                initHeroThreeJS();
                bindHeroActionButtons();
            }

            setupNavbarScrollSpy();

            if (typeof initMindmap === 'function') {
                initMindmap();
            }

            if (!animationRunning && (document.getElementById('robot-canvas-container') || document.getElementById('hero-robot-canvas-container'))) {
                animationRunning = true;
                animate();
            }
        }

        // Architecture Video Player Source Switcher (Local MP4 vs Google Drive Stream)
        function switchArchVideoSource(mode) {
            const nativePlayer = document.getElementById('arch-video-player');
            const driveFrame = document.getElementById('arch-video-drive-frame');
            const btnNative = document.getElementById('btn-video-native');
            const btnDrive = document.getElementById('btn-video-drive');

            if (!nativePlayer || !driveFrame) return;

            if (mode === 'drive') {
                try { nativePlayer.pause(); } catch (e) {}
                nativePlayer.classList.add('hidden');
                if (!driveFrame.src || driveFrame.src === 'about:blank') {
                    const dataSrc = driveFrame.getAttribute('data-src');
                    if (dataSrc) driveFrame.src = dataSrc;
                }
                driveFrame.classList.remove('hidden');

                if (btnDrive) {
                    btnDrive.classList.add('bg-white', 'shadow-sm', 'font-semibold', 'text-[#1d1d1f]');
                    btnDrive.classList.remove('text-[#86868b]');
                }
                if (btnNative) {
                    btnNative.classList.remove('bg-white', 'shadow-sm', 'font-semibold', 'text-[#1d1d1f]');
                    btnNative.classList.add('text-[#86868b]');
                }
            } else {
                driveFrame.classList.add('hidden');
                nativePlayer.classList.remove('hidden');

                if (btnNative) {
                    btnNative.classList.add('bg-white', 'shadow-sm', 'font-semibold', 'text-[#1d1d1f]');
                    btnNative.classList.remove('text-[#86868b]');
                }
                if (btnDrive) {
                    btnDrive.classList.remove('bg-white', 'shadow-sm', 'font-semibold', 'text-[#1d1d1f]');
                    btnDrive.classList.add('text-[#86868b]');
                }
            }
        }

        function playArchVideo() {
            const poster = document.getElementById('arch-video-poster-wrapper');
            const iframe = document.getElementById('arch-video-drive-frame');
            if (poster) {
                poster.style.transition = 'opacity 0.4s ease';
                poster.style.opacity = '0';
                poster.style.pointerEvents = 'none';
                setTimeout(() => poster.classList.add('hidden'), 400);
            }
            if (iframe) {
                const dataSrc = iframe.getAttribute('data-src') || 'https://drive.google.com/file/d/16WDn-dwJVw0XK_wAv9IXwVFTcsCj31lx/preview';
                if (!iframe.src || iframe.src === 'about:blank' || !iframe.src.includes('drive.google.com')) {
                    iframe.src = dataSrc + (dataSrc.includes('?') ? '&' : '?') + 'autoplay=1';
                }
            }
        }

        window.playArchVideo = playArchVideo;
        window.switchArchVideoSource = switchArchVideoSource;

        /***********************************************************************
         * 7. GOOGLE NOTEBOOKLM INTERACTIVE ARCHITECTURE MIND MAP
         ***********************************************************************/
        const CYNO_MINDMAP_DATA = {
    id: 'root',
    title: 'CYNO BOT Autonomous Core',
    subtitle: 'Unified Humanoid Architecture (ATP G 40)',
    category: 'SYSTEM ROOT',
    color: '#6366f1',
    icon: 'fa-robot',
    description: 'The complete cyber-physical architecture of CYNO BOT, integrating Apple M1 neural AI with real-time embedded hardware control, multimodal HRI, and industrial fabrication.',
    specs: {
        'Platform': 'CYNO BOT v1.0 Life-Size Humanoid',
        'Host System': 'Apple Mac mini (M1, 8-Core CPU, 16-Core ANE)',
        'Operating Scale': '1.67m Monolithic Stance Scale',
        'Architecture': '5 Core Pillars &bull; 16 Subsystems &bull; 76 Nodes'
    },
    children: [
        // Pillar 1: Computing & Neural AI Core
        {
            id: 'p1-computing',
            title: 'Computing, Firmware & AI Core',
            subtitle: 'Host processor, dual ESP32 & power bus',
            category: 'PILLAR 01',
            color: '#818cf8',
            icon: 'fa-brain',
            description: 'Central computational backbone hosting air-gapped neural networks, real-time microcontrollers, and isolated power regulation.',
            specs: {
                'Host Processor': 'Apple Mac mini (M1)',
                'Embedded Controllers': 'Dual ESP32-WROOM-32',
                'Power Supply': '24V 15Ah Cobalt Lithium'
            },
            children: [
                {
                    id: 'sub-1-1',
                    title: 'Apple M1 Neural Host Core',
                    subtitle: 'Local AI, STT & cognition host',
                    category: 'HOST BRAIN',
                    color: '#38bdf8',
                    icon: 'fa-server',
                    description: 'High-performance on-device processing unit running local Whisper speech recognition, quantized language models, and spatial vision.',
                    specs: { 'SoC': 'Apple M1 (8 Cores)', 'Unified RAM': '16GB 68GB/s', 'Storage': '512GB NVMe SSD' },
                    children: [
                        { id: 'leaf-1', title: 'M1 8-Core Heterogeneous CPU', subtitle: '4 Performance + 4 Efficiency cores', category: 'CPU', color: '#4ade80', icon: 'fa-microchip', description: 'Runs background OS threads, MediaPipe tracking, and telemetry services.', specs: { 'Cores': '4P + 4E Cores', 'Clock': '3.2 GHz Max', 'TDP': '10W-39W' } },
                        { id: 'leaf-2', title: '16-Core Apple Neural Engine (ANE)', subtitle: '11 TOPS matrix hardware accelerator', category: 'NPU', color: '#4ade80', icon: 'fa-bolt', description: 'Executes CoreML neural graphs for instant local speech transcription and vision.', specs: { 'Throughput': '11 Trillion Ops/Sec', 'Precision': 'FP16 / INT8', 'Latency': '<15ms' } },
                        { id: 'leaf-3', title: '16GB Unified High-Speed Memory', subtitle: '68.25 GB/s unified memory pool', category: 'MEMORY', color: '#4ade80', icon: 'fa-memory', description: 'Direct zero-copy shared memory buffer between CPU, GPU, and Neural Engine.', specs: { 'Bandwidth': '68.25 GB/s', 'Latency': '<25ns', 'Architecture': 'LPDDR4X' } },
                        { id: 'leaf-4', title: 'CoreML Optimized Neural Pipeline', subtitle: 'Whisper.cpp & CoreML runtime', category: 'RUN-TIME', color: '#4ade80', icon: 'fa-gears', description: 'Quantized graph compilation providing 180ms voice-to-text response.', specs: { 'Quantization': 'FP16 CoreML graph', 'Latency': '~180ms', 'Accuracy': '96.4%' } },
                        { id: 'leaf-5', title: '512GB High-Speed NVMe Storage', subtitle: '3,300 MB/s sequential read cache', category: 'STORAGE', color: '#4ade80', icon: 'fa-hard-drive', description: 'Local storage for offline LLM weights, campus maps, and voice audio assets.', specs: { 'Read Speed': '3,300 MB/s', 'Write Speed': '2,800 MB/s', 'Interface': 'PCIe Gen4' } },
                        { id: 'leaf-6', title: 'Local macOS Darwin Unix Sandbox', subtitle: 'Air-gapped offline environment', category: 'SECURITY', color: '#4ade80', icon: 'fa-shield-halved', description: 'Zero cloud dependency ensuring 100% data privacy for student and visitor interactions.', specs: { 'Network': 'Isolated Air-Gapped', 'Security': 'SIP Enabled', 'Telemetry': 'Disabled' } }
                    ]
                },
                {
                    id: 'sub-1-2',
                    title: 'Dual ESP32 Firmware Bridge',
                    subtitle: 'Real-time motor & sensor control',
                    category: 'EMBEDDED MCU',
                    color: '#38bdf8',
                    icon: 'fa-microchip',
                    description: 'Embedded real-time microcontrollers bridging high-level Python commands to low-level PWM servo kinematics and telemetry sensors.',
                    specs: { 'MCU': '2x ESP32-WROOM-32', 'Clock': '240 MHz Dual-Core', 'RTOS': 'FreeRTOS Preemptive' },
                    children: [
                        { id: 'leaf-7', title: 'Dual ESP32-WROOM-32 MCUs', subtitle: '240MHz Xtensa LX6 processors', category: 'MCU', color: '#4ade80', icon: 'fa-microchip', description: 'Primary controller manages sensor multiplexing; secondary controller drives PWM servos.', specs: { 'Clock': '240 MHz', 'Flash': '4MB SPI', 'SRAM': '520 KB' } },
                        { id: 'leaf-8', title: 'Opto-Isolated USB UART CDC', subtitle: '115,200 bps full-duplex serial', category: 'SERIAL BUS', color: '#4ade80', icon: 'fa-network-wired', description: 'Noise-immune communication link delivering continuous telemetry packets to M1.', specs: { 'Baud Rate': '115,200 bps', 'Protocol': 'Custom CRC-16 Frame', 'Latency': '<1ms' } },
                        { id: 'leaf-9', title: 'Hardware Heartbeat Watchdog', subtitle: '500ms safety auto-reset timer', category: 'WATCHDOG', color: '#4ade80', icon: 'fa-clock-rotate-left', description: 'Monitors communication heartbeat and immediately safes all motors if link drops.', specs: { 'Timeout': '500 ms', 'Action': 'PWM Cut-off + Safe Stance', 'Type': 'Hardware Timer' } },
                        { id: 'leaf-10', title: '16-Channel PWM Servo Drivers', subtitle: '50Hz to 20kHz low-jitter control', category: 'PWM DRIVER', color: '#4ade80', icon: 'fa-sliders', description: 'Generates jitter-free pulse-width modulation for smooth arm and head joint motion.', specs: { 'Resolution': '12-bit Hardware PWM', 'Frequency': '50 Hz Servos', 'Channels': '16 Independent' } }
                    ]
                },
                {
                    id: 'sub-1-3',
                    title: 'Power Bus & Energy Storage',
                    subtitle: '24V lithium pack & dual buck rails',
                    category: 'POWER SYSTEM',
                    color: '#38bdf8',
                    icon: 'fa-battery-full',
                    description: 'High-density onboard lithium battery system with isolated DC-DC regulators and hardware safety disconnects.',
                    specs: { 'Pack Voltage': '24V Nominal (29.4V Peak)', 'Capacity': '15Ah (360Wh)', 'Runtime': '8–12 Hours' },
                    children: [
                        { id: 'leaf-11', title: '24V 15Ah Cobalt-Lithium Pack', subtitle: '360Wh high-capacity energy cell', category: 'BATTERY', color: '#4ade80', icon: 'fa-car-battery', description: 'Provides all-day operational autonomy; seated in lower chassis for anti-tip balance.', specs: { 'Chemistry': 'Li-ion Cobalt (NMC)', 'Capacity': '15Ah (360Wh)', 'Weight': '3.2 kg' } },
                        { id: 'leaf-12', title: 'Smart Battery Management (BMS)', subtitle: 'Over-discharge & thermal cutoff', category: 'BMS', color: '#4ade80', icon: 'fa-shield-virus', description: 'Continuous cell voltage balancing with automatic over-current and thermal isolation.', specs: { 'Max Discharge': '30A Continuous', 'Balance Current': '50mA/cell', 'Cut-off': '21.0V' } },
                        { id: 'leaf-13', title: 'Isolated 24V-to-12V Buck Converter', subtitle: 'Synchronous DC-DC 12V 5A host rail', category: 'BUCK REG', color: '#4ade80', icon: 'fa-bolt', description: 'Delivers ultra-stable clean 12V direct power to the Apple Mac mini motherboard.', specs: { 'Efficiency': '>94%', 'Ripple': '<25mV Peak-to-Peak', 'Current': '5A Continuous' } },
                        { id: 'leaf-14', title: 'High-Current 24V-to-5V 10A Bus', subtitle: 'Step-down supply for servos & logic', category: '5V RAIL', color: '#4ade80', icon: 'fa-plug', description: 'High-current rail powering 16 joint servos, touchscreen kiosk, and microcontrollers.', specs: { 'Output': '5.2V @ 10A Peak', 'Protection': 'Current Limiting + Crowbar', 'Capacitors': 'Solid Polymer' } },
                        { id: 'leaf-15', title: 'Master Emergency Stop (E-Stop)', subtitle: 'Industrial latching disconnect switch', category: 'E-STOP', color: '#4ade80', icon: 'fa-hand', description: 'Physical red mushroom push-switch immediately disconnecting raw 24V battery power.', specs: { 'Rating': '250V 10A Latching', 'Placement': 'Rear Torso Access', 'Response': '<5ms Physical Break' } },
                        { id: 'leaf-16', title: 'Solid-State Soft-Start Controller', subtitle: 'Inrush surge protection circuit', category: 'SURGE', color: '#4ade80', icon: 'fa-wave-square', description: 'Controls gate voltage on master MOSFETs to eliminate high-voltage sparking during power-up.', specs: { 'Ramp Time': '120 ms', 'Peak Limiting': '<2A Inrush', 'MOSFETs': 'Dual Low-RDS(on)' } }
                    ]
                }
            ]
        },

        // Pillar 2: Sensing, Vision & Spatial Perception
        {
            id: 'p2-sensing',
            title: 'Sensing, Vision & Perception',
            subtitle: 'Camera, acoustics, radar & safety',
            category: 'PILLAR 02',
            color: '#38bdf8',
            icon: 'fa-eye',
            description: 'Multi-modal perception pipeline gathering real-time spatial, visual, acoustic, and environmental telemetry.',
            specs: {
                'Vision Sensor': '1080p Optical Eye',
                'Audio Bus': 'Stereo Beamforming Array',
                'Radar Range': '0.3m to 4.0m Perimeter'
            },
            children: [
                {
                    id: 'sub-2-1',
                    title: '1080p Optical Vision Suite',
                    subtitle: 'Facial landmarks & gaze orientation',
                    category: 'VISION',
                    color: '#2dd4bf',
                    icon: 'fa-camera',
                    description: 'Wide-angle camera feeding real-time MediaPipe and OpenCV pipelines to detect visitors and direct gaze tracking.',
                    specs: { 'Resolution': '1080p Full HD', 'FOV': '110° Diagonal', 'FPS': '30 FPS UVC Stream' },
                    children: [
                        { id: 'leaf-17', title: '1080p Wide-Angle Optical Sensor', subtitle: '1920x1080 @ 30 FPS HD video stream', category: 'CAMERA', color: '#4ade80', icon: 'fa-video', description: 'Mounted inside head visor for human presence detection and gesture recognition.', specs: { 'Sensor': '1/2.7" CMOS', 'Interface': 'USB 3.0 UVC', 'FOV': '110° Wide Angle' } },
                        { id: 'leaf-18', title: 'MediaPipe Face Mesh Tracker', subtitle: '468 3D facial coordinate landmarks', category: 'FACE AI', color: '#4ade80', icon: 'fa-user-check', description: 'Tracks visitor facial contours to estimate attention and interaction interest.', specs: { 'Landmarks': '468 Points', 'Inference Time': '14 ms on ANE', 'Tracker': 'MediaPipe v0.10' } },
                        { id: 'leaf-19', title: 'Kinematic Gaze Alignment Engine', subtitle: 'Directs head & eye orientation', category: 'GAZE', color: '#4ade80', icon: 'fa-eye', description: 'Translates visitor 3D coordinates into pan-tilt servo angles for direct eye contact.', specs: { 'Tracking Rate': '60 Hz Smooth Gaze', 'Deadband': '±2° Jitter Filter', 'Max Velocity': '90°/sec' } },
                        { id: 'leaf-20', title: 'Dynamic Auto-Exposure Algorithm', subtitle: 'Photometric ambient illumination', category: 'EXPOSURE', color: '#4ade80', icon: 'fa-sun', description: 'Adjusts camera sensor gain dynamically across bright reception sun and dim lobbies.', specs: { 'Dynamic Range': '72 dB', 'Response': '<60ms Gain Step', 'Metering': 'Center Weighted' } },
                        { id: 'leaf-21', title: 'Privacy-Compliant Video Buffer', subtitle: 'Volatile in-memory frame processing', category: 'PRIVACY', color: '#4ade80', icon: 'fa-lock', description: 'Frames discarded immediately after landmark extraction with zero storage or uploads.', specs: { 'Storage': 'Zero Frame Retention', 'Compliance': 'GDPR & Academic Ethics', 'Buffer': 'RAM Ring Buffer' } }
                    ]
                },
                {
                    id: 'sub-2-2',
                    title: 'Directional Acoustic Suite',
                    subtitle: 'Beamforming mics & stereo audio',
                    category: 'ACOUSTICS',
                    color: '#2dd4bf',
                    icon: 'fa-microphone-lines',
                    description: 'Acoustic sensing and reproduction system tuned for natural human dialogue in noisy public entrance halls.',
                    specs: { 'Microphones': 'Dual Beamforming Array', 'Audio DAC': 'I2S Stereo 24-bit', 'Speakers': 'Dual 10W Neodymium' },
                    children: [
                        { id: 'leaf-22', title: 'Dual Beamforming Mic Array', subtitle: 'Directional spatial speech capture', category: 'MICROPHONES', color: '#4ade80', icon: 'fa-microphone', description: 'Isolates visitor voice directly in front of the robot while rejecting side hallway echoes.', specs: { 'Pattern': 'Cardioid Beamforming', 'SNR': '68 dB', 'Frequency': '50Hz–16kHz' } },
                        { id: 'leaf-23', title: 'Hardware Active Noise Filtering', subtitle: 'HVAC & room reverberation filter', category: 'DSP', color: '#4ade80', icon: 'fa-filter', description: 'Digital signal processing eliminates fan drone, AC hum, and distant footsteps.', specs: { 'Attenuation': '24 dB Noise Cut', 'Latency': '<8ms Filter Delay', 'Type': 'Spectral Subtraction' } },
                        { id: 'leaf-24', title: 'Low-Latency I2S Digital Bus', subtitle: '16kHz 16-bit uncompressed audio feed', category: 'AUDIO BUS', color: '#4ade80', icon: 'fa-wave-square', description: 'Direct digital audio stream delivered to Whisper STT for real-time transcription.', specs: { 'Sampling': '16,000 Hz', 'Bit Depth': '16-bit Linear PCM', 'Protocol': 'I2S Master' } },
                        { id: 'leaf-25', title: 'Voice Activity Detection (VAD)', subtitle: 'Energy-threshold speech trigger', category: 'VAD', color: '#4ade80', icon: 'fa-waveform', description: 'Instantly detects when a visitor begins speaking to pause robot voice and listen.', specs: { 'Trigger Latency': '<20ms', 'Threshold': '-32 dBFS Dynamic', 'Engine': 'Silero VAD' } },
                        { id: 'leaf-26', title: 'Stereo 10W Vocal Speakers', subtitle: 'High-clarity speech projection', category: 'SPEAKERS', color: '#4ade80', icon: 'fa-volume-high', description: 'Dual neodymium drivers located in head ears projecting clear, comforting vocal replies.', specs: { 'Power': '2x 10W Peak', 'THD': '<0.5%', 'Enclosure': 'Acoustic Baffle Box' } }
                    ]
                },
                {
                    id: 'sub-2-3',
                    title: 'Ultrasonic Proximity Radar',
                    subtitle: 'Multi-zone presence detection',
                    category: 'RADAR',
                    color: '#2dd4bf',
                    icon: 'fa-satellite-dish',
                    description: 'Ultrasonic rangefinders mapped at 1.5m–3m intervals to trigger autonomous greeting sequences before touch interaction.',
                    specs: { 'Range': '2cm to 400cm', 'Resolution': '±3mm', 'Transducers': 'HC-SR04 Modules' },
                    children: [
                        { id: 'leaf-27', title: 'Ultrasonic Rangefinder Array', subtitle: '2cm–400cm spatial distance mapping', category: 'SENSOR', color: '#4ade80', icon: 'fa-ruler-combined', description: 'Measures visitor proximity to autonomously transition robot from idle to greeting.', specs: { 'Beam Angle': '15° Cone', 'Pulse Frequency': '40 kHz', 'Accuracy': '±3 mm' } },
                        { id: 'leaf-28', title: 'Two-Zone Greeting Trigger Logic', subtitle: 'Zone A (3m alert) & Zone B (1.5m greet)', category: 'STATE LOGIC', color: '#4ade80', icon: 'fa-bullseye', description: 'Zone A wakes eyes and centers head; Zone B triggers arm wave and spoken welcome.', specs: { 'Zone A': '1.5m – 3.0m Notice', 'Zone B': '0.5m – 1.5m Engage', 'Debounce': '300ms Filter' } },
                        { id: 'leaf-29', title: 'Forward Obstacle Clearance Guard', subtitle: 'Collision prevention safety perimeter', category: 'SAFETY', color: '#4ade80', icon: 'fa-shield-halved', description: 'Prevents gestures or movement if a person stands closer than safe operating limits.', specs: { 'Minimum Distance': '30 cm', 'Response': 'Immediate Motion Freeze', 'Priority': 'Safety Interrupt' } },
                        { id: 'leaf-30', title: 'Sensor Fusion Telemetry Loop', subtitle: 'Combines camera depth with radar', category: 'FUSION', color: '#4ade80', icon: 'fa-layer-group', description: 'Cross-verifies ultrasonic range with camera face bounding box to prevent false alerts.', specs: { 'Algorithm': 'Kalman Filter', 'Update Rate': '50 Hz', 'Confidence Score': 'Weighted 0.85' } }
                    ]
                },
                {
                    id: 'sub-2-4',
                    title: 'Air & Environmental Safety',
                    subtitle: 'Gas, smoke, flame & heat monitors',
                    category: 'SAFETY TELEMETRY',
                    color: '#2dd4bf',
                    icon: 'fa-shield-virus',
                    description: 'Continuous monitoring of indoor air quality, ambient smoke, flame hazards, and internal chassis temperatures.',
                    specs: { 'Gas Sensor': 'MQ-135 Multi-Gas', 'Flame Response': '<100ms Optical', 'Thermal Sensors': 'NTC Thermistors' },
                    children: [
                        { id: 'leaf-31', title: 'MQ-135 Hazardous Gas Monitor', subtitle: 'Detects CO2, smoke, ammonia, VOCs', category: 'GAS DETECT', color: '#4ade80', icon: 'fa-smog', description: 'Continuously measures lobby air quality and sounds caution tone if smoke is detected.', specs: { 'Detection': '10–1000 ppm', 'Target Gases': 'CO2, NH3, Benzene, Smoke', 'Bus': 'ADC 12-bit' } },
                        { id: 'leaf-32', title: 'Optical Infrared Flame Sensor', subtitle: '<100ms optical fire radiation trigger', category: 'FLAME', color: '#4ade80', icon: 'fa-fire', description: 'Detects infrared radiation between 760nm–1100nm to identify open flame hazards.', specs: { 'Wavelength': '760–1100 nm', 'Detection Angle': '60°', 'Response Time': '<100 ms' } },
                        { id: 'leaf-33', title: 'Internal Chassis Thermistors', subtitle: 'Monitors M1 and battery pack heat', category: 'THERMAL', color: '#4ade80', icon: 'fa-temperature-half', description: 'Monitors internal electronics enclosure to prevent thermal throttling or battery strain.', specs: { 'Type': 'NTC 10K Thermistors', 'Accuracy': '±0.5°C', 'Trip Temp': '65°C Alert' } },
                        { id: 'leaf-34', title: 'Automatic PWM Cooling Fans', subtitle: 'Thermostatically modulated exhausts', category: 'COOLING', color: '#4ade80', icon: 'fa-fan', description: 'Spins dual low-noise brushless fans proportionally based on internal enclosure heat.', specs: { 'Airflow': '38 CFM', 'Noise Level': '<22 dBA', 'Control': 'PWM 25kHz' } }
                    ]
                }
            ]
        },

        // Pillar 3: Multimodal HRI & Interactive Kiosk
        {
            id: 'p3-hri',
            title: 'Multimodal HRI & Kiosk',
            subtitle: '10" touchscreen, OLED eyes & lighting',
            category: 'PILLAR 03',
            color: '#10b981',
            icon: 'fa-user-group',
            description: 'Engaging physical interaction surfaces inviting visitors into intuitive, bilingual reception engagements.',
            specs: {
                'Kiosk Display': '10.1" Capacitive IPS Hub',
                'Eyes': 'Dual 0.96" SSD1306 Displays',
                'Halos': 'WS2812B NeoPixel Rings'
            },
            children: [
                {
                    id: 'sub-3-1',
                    title: '10" Capacitive Chest Kiosk Hub',
                    subtitle: 'Touchscreen campus wayfinding UI',
                    category: 'KIOSK UI',
                    color: '#2dd4bf',
                    icon: 'fa-tablet-screen-button',
                    description: 'Vibrant touchscreen display embedded into the chest armor providing campus maps, event registration, and QR sharing.',
                    specs: { 'Display': '10.1" IPS LCD', 'Resolution': '1280x800', 'Touch': '10-Point Multi-Touch' },
                    children: [
                        { id: 'leaf-35', title: '10.1" IPS High-Brightness Panel', subtitle: '1280x800 resolution & 450 nits', category: 'DISPLAY', color: '#4ade80', icon: 'fa-tv', description: 'Wide-viewing-angle IPS panel readable under bright lobby fluorescent fixtures.', specs: { 'Resolution': '1280x800 IPS', 'Brightness': '450 nits', 'Viewing Angle': '178°' } },
                        { id: 'leaf-36', title: '10-Point Capacitive Digitizer', subtitle: 'Fast 120Hz responsive touch glass', category: 'TOUCH', color: '#4ade80', icon: 'fa-hand-pointer', description: 'Smooth smartphone-grade glass digitizer supporting pinch-to-zoom on campus maps.', specs: { 'Touch Points': '10 Concurrent', 'Sample Rate': '120 Hz', 'Surface': 'Tempered 7H Glass' } },
                        { id: 'leaf-37', title: 'Embedded Kiosk Web Client', subtitle: 'Vue.js & Tailwind responsive kiosk UI', category: 'WEB APP', color: '#4ade80', icon: 'fa-code', description: 'Hardened kiosk interface with high-contrast accessibility buttons and quick navigation.', specs: { 'Framework': 'Vanilla JS / Tailwind', 'Security': 'Kiosk Lockout Mode', 'FPS': '60 FPS CSS Transitions' } },
                        { id: 'leaf-38', title: 'Interactive Campus Directory', subtitle: 'Faculty offices & classroom maps', category: 'DIRECTORY', color: '#4ade80', icon: 'fa-map-location-dot', description: 'Searchable database guiding visitors to lectures, dean offices, and campus labs.', specs: { 'Search Time': '<5ms Local SQLite', 'Floor Plans': 'Vector SVG Maps', 'Categories': 'Departments, Facilities' } },
                        { id: 'leaf-39', title: 'Event Agenda & QR Pass Generator', subtitle: 'Broadcasts Wi-Fi & seminar passes', category: 'QR HUB', color: '#4ade80', icon: 'fa-qrcode', description: 'Generates live QR codes that visitors scan with their phones to save directions.', specs: { 'QR Generator': 'Client-Side Dynamic', 'Format': 'Standard vCard & URL', 'Update': 'Daily Sync' } }
                    ]
                },
                {
                    id: 'sub-3-2',
                    title: 'Dual Animated OLED Eyes',
                    subtitle: 'Procedural facial expressions',
                    category: 'EXPRESSION',
                    color: '#2dd4bf',
                    icon: 'fa-face-smile',
                    description: 'Displays procedural facial animations: natural blinking, smiling, listening, thinking, and joyful greetings.',
                    specs: { 'Type': 'Monochrome OLED', 'Interface': 'I2C Bus 400kHz', 'Frame Rate': '60 FPS' },
                    children: [
                        { id: 'leaf-40', title: 'Dual 0.96" I2C OLED Displays', subtitle: '128x64 pixels each (SSD1306 driver)', category: 'OLED', color: '#4ade80', icon: 'fa-display', description: 'High-contrast cyan OLED screens mounted in facial visor behind dark acrylic glass.', specs: { 'Resolution': '128x64 per eye', 'Driver': 'SSD1306 I2C', 'Contrast': '10,000:1 True Black' } },
                        { id: 'leaf-41', title: '60 FPS Procedural Blink Engine', subtitle: 'Natural eyelid kinematics & wandering', category: 'KINEMATICS', color: '#4ade80', icon: 'fa-eye-slash', description: 'Algorithms model human blinking timing (every 3–6s) with randomized micro-movements.', specs: { 'Frame Rate': '60 FPS Procedural', 'Blink Duration': '180 ms', 'Algorithm': 'Perlin Noise Wandering' } },
                        { id: 'leaf-42', title: '6 Expressive Mood States', subtitle: 'Happy, listening, thinking, sleepy', category: 'MOODS', color: '#4ade80', icon: 'fa-icons', description: 'Distinct eyelid shapes reflecting AI conversational status and visitor sentiment.', specs: { 'Modes': 'Normal, Happy, Think, Sleep, Error, Wow', 'Transition': 'Morphing Vector Paths', 'Sync': 'Voice Linked' } },
                        { id: 'leaf-43', title: 'Real-Time Pupil Gaze Steering', subtitle: 'Pupils shift toward visitor coordinates', category: 'GAZE', color: '#4ade80', icon: 'fa-arrows-to-dot', description: 'Pupils look left, right, up, down following visitor face tracking in real time.', specs: { 'Gaze Range': '±24 pixels offset', 'Smoothing': 'Spring-damper filter', 'Latency': '<30ms' } }
                    ]
                },
                {
                    id: 'sub-3-3',
                    title: 'NeoPixel Halo & Speech Sync',
                    subtitle: 'Audio reactive lighting feedback',
                    category: 'HALO LIGHTING',
                    color: '#2dd4bf',
                    icon: 'fa-lightbulb',
                    description: 'Subtle ring indicators that pulse in sync with voice speech, AI listening status, and diagnostic modes.',
                    specs: { 'LEDs': '32x Addressable RGB', 'Data Rate': '800 kbps', 'Power': 'Isolated 5V Rail' },
                    children: [
                        { id: 'leaf-44', title: 'WS2812B Addressable LED Rings', subtitle: '32 RGB LEDs on ears and chest bezel', category: 'NEOPIXEL', color: '#4ade80', icon: 'fa-circle-notch', description: 'High-brightness full-color LEDs providing ambient glows visible from 10 meters.', specs: { 'LED Count': '32 Smart RGB', 'Color Depth': '24-bit 16.7M Colors', 'Current': '60mA per LED Max' } },
                        { id: 'leaf-45', title: 'Speech-Synchronized Audio Pulses', subtitle: 'Halos swell in rhythm with vocal output', category: 'AUDIO SYNC', color: '#4ade80', icon: 'fa-music', description: 'LED intensity maps to output audio waveform amplitude for natural speaking effect.', specs: { 'Sync Engine': 'FFT Band Analysis', 'Sampling': '60 FPS Amplitude Map', 'Color': 'Cyan 490nm Glow' } },
                        { id: 'leaf-46', title: 'Visual AI Status State Codes', subtitle: 'Listening (blue), Thinking (cyan), Ready (green)', category: 'STATUS', color: '#4ade80', icon: 'fa-traffic-light', description: 'Instant color feedback so visitors know when the robot is listening or generating replies.', specs: { 'Listen': 'Blinking Deep Blue', 'Generate': 'Pulsing Bright Cyan', 'Ready': 'Steady Emerald' } },
                        { id: 'leaf-47', title: 'Emergency Hazard Strobe Sequence', subtitle: 'Red/amber flashes on safety faults', category: 'ALARM', color: '#4ade80', icon: 'fa-triangle-exclamation', description: 'Bright pulsing alerts trigger immediately if smoke, flame, or battery faults occur.', specs: { 'Strobe Rate': '3 Hz Alarm Pulse', 'Color': 'Amber 590nm / Red 620nm', 'Priority': 'Hardware Interrupt' } }
                    ]
                }
            ]
        },

        // Pillar 4: Chassis, Kinematics & Mechanics
        {
            id: 'p4-chassis',
            title: 'Chassis, Kinematics & Mechanics',
            subtitle: 'Extrusion skeleton, servos & armor',
            category: 'PILLAR 04',
            color: '#f59e0b',
            icon: 'fa-gears',
            description: 'Robust mechanical skeleton, articulated servo kinematic linkages, and lightweight ergonomic 3D-printed armor.',
            specs: {
                'Frame': '2020 T-Slot Aluminum',
                'Shell Material': 'PETG & Dark Titanium Armor',
                'Height': '1.67m Monolithic Stance'
            },
            children: [
                {
                    id: 'sub-4-1',
                    title: '2020 Aluminum Skeleton Frame',
                    subtitle: 'Rigid spine & counterweighted base',
                    category: 'STRUCTURE',
                    color: '#fbbf24',
                    icon: 'fa-cubes-stacked',
                    description: 'Internal structural skeleton engineered from anodized aluminum extrusions and CNC steel plates for long-term durability.',
                    specs: { 'Material': '6063-T5 Aluminum', 'Weight': '14.5 kg Complete', 'Payload': '15 kg Internal' },
                    children: [
                        { id: 'leaf-48', title: '2020 Anodized T-Slot Extrusions', subtitle: 'Modular spine and torso skeleton', category: 'SKELETON', color: '#4ade80', icon: 'fa-bars', description: 'High-strength aluminum framework allowing adjustable mounting for electronics and battery.', specs: { 'Extrusion': '20x20mm T-Slot', 'Finish': 'Anodized Black', 'Tensile': '215 MPa' } },
                        { id: 'leaf-49', title: 'CNC Laser-Cut Steel Brackets', subtitle: 'Reinforced joint gussets & braces', category: 'BRACKETS', color: '#4ade80', icon: 'fa-square', description: 'Heavy-gauge steel angle brackets eliminating frame flex during arm waving.', specs: { 'Steel': '3mm Mild Steel', 'Coating': 'Black Powder Coat', 'Fasteners': 'M5 High-Tensile' } },
                        { id: 'leaf-50', title: 'Counterweighted Disc Floor Base', subtitle: 'Anti-tip stability up to 25° incline', category: 'BASE', color: '#4ade80', icon: 'fa-circle', description: 'Low center-of-gravity weighted base preventing tipping even if bumped in crowded halls.', specs: { 'Diameter': '460 mm', 'Base Weight': '8.5 kg', 'Safety Margin': '25° Tilt Stability' } },
                        { id: 'leaf-51', title: 'Lockable Ground Rolling Casters', subtitle: 'Smooth transit & secure stage locking', category: 'CASTERS', color: '#4ade80', icon: 'fa-circle-dot', description: 'Allows easy single-person transport between auditorium, lobby, and exhibition stalls.', specs: { 'Wheels': '4x Polyurethane Casters', 'Brake': 'Dual Total-Lock Foot Pedal', 'Capacity': '40 kg each' } }
                    ]
                },
                {
                    id: 'sub-4-2',
                    title: 'Articulated Joints & Kinematics',
                    subtitle: 'Arm waving & pan-tilt head gimbal',
                    category: 'KINEMATICS',
                    color: '#fbbf24',
                    icon: 'fa-hand',
                    description: 'High-torque joint actuators driving welcoming hand waves and natural head nodding without pinch points.',
                    specs: { 'Servos': 'MG996R Metal-Gear', 'Torque': '11 kg-cm @ 6V', 'Degrees of Freedom': '3-DOF Active' },
                    children: [
                        { id: 'leaf-52', title: 'High-Torque Metal-Gear Servos', subtitle: 'MG996R actuators driving joint motion', category: 'ACTUATORS', color: '#4ade80', icon: 'fa-gears', description: 'Full metal gear train with dual ball bearings handling dynamic waving stresses.', specs: { 'Torque': '11 kg-cm @ 6.0V', 'Speed': '0.17s/60°', 'Gear Train': 'Brass & Aluminum' } },
                        { id: 'leaf-53', title: 'Head Pan-Tilt Dual-Axis Gimbal', subtitle: '±45° pan and ±30° tilt head motion', category: 'GIMBAL', color: '#4ade80', icon: 'fa-arrows-up-down-left-right', description: 'Smooth dual-axis gimbal matching visitor eye-level during conversation.', specs: { 'Pan Range': '±45° (90° total)', 'Tilt Range': '±30° (60° total)', 'Resolution': '0.5° Angular Step' } },
                        { id: 'leaf-54', title: 'Pinch-Free Ball Joint Linkage', subtitle: 'Enclosed articulation without hazards', category: 'SAFETY JOINT', color: '#4ade80', icon: 'fa-shield', description: 'All pivot joints enclosed in curved housing ensuring children cannot trap fingers.', specs: { 'Enclosure': 'Concentric Ball Shell', 'Clearance': '<1mm Finger Gap', 'Compliance': 'ISO 13482 Robotics' } },
                        { id: 'leaf-55', title: 'Current-Limiting Safety Clutch', subtitle: 'Auto-slips if external force resists motion', category: 'CLUTCH', color: '#4ade80', icon: 'fa-link-slash', description: 'Servos automatically drop torque if someone holds the arm to prevent motor burnout.', specs: { 'Cut-Off Threshold': '2.2A Stall Current', 'Response': '<40 ms', 'Mechanical': 'Friction Slip Disc' } }
                    ]
                },
                {
                    id: 'sub-4-3',
                    title: 'Exterior 3D-Printed Armor Shell',
                    subtitle: 'PETG aerodynamic panels & hatches',
                    category: 'AESTHETIC SHELL',
                    color: '#fbbf24',
                    icon: 'fa-shield-halved',
                    description: 'Lightweight, durable, UV-resistant exterior panels styled with Apple-inspired rounded contours and matte finish.',
                    specs: { 'Polymer': 'PETG & Matte White', 'Infill': '25% Gyroid', 'Weight': '4.2 kg Shell' },
                    children: [
                        { id: 'leaf-56', title: 'Matte White & Dark Titanium PETG', subtitle: 'Impact-resistant 3D printed panels', category: 'ARMOR', color: '#4ade80', icon: 'fa-cube', description: 'Durable thermoplastic panels with high glass-transition temperature resistant to lobby heat.', specs: { 'Material': 'PETG Polymer', 'Tensile Strength': '50 MPa', 'Finish': 'Matte Ceramic White' } },
                        { id: 'leaf-57', title: 'Magnetic Service Access Hatches', subtitle: 'Tool-free access to M1 and battery', category: 'HATCHES', color: '#4ade80', icon: 'fa-magnet', description: 'Neodymium magnetic latches allow quick battery swaps and logic inspection in seconds.', specs: { 'Magnets': 'N52 Neodymium Discs', 'Holding Force': '4.5 kg per hatch', 'Fasteners': 'Zero Tool Required' } },
                        { id: 'leaf-58', title: 'Acoustic Mesh Ventilation Louvers', subtitle: 'Engineered chimney thermal exhaust', category: 'VENTILATION', color: '#4ade80', icon: 'fa-wind', description: 'Hidden ventilation slots in upper shoulders allowing natural convective heat escape.', specs: { 'Free Area': '65 cm²', 'Dust Filter': 'Fine Nylon Mesh', 'Acoustics': 'Sound Baffled' } },
                        { id: 'leaf-59', title: 'Life-Size 1.67m Humanoid Stance', subtitle: 'Proportioned to natural human eye-level', category: 'ERGONOMICS', color: '#4ade80', icon: 'fa-person', description: 'Carefully measured height creating a welcoming, non-intimidating presence for guests.', specs: { 'Height': '1.67 meters (5 ft 6 in)', 'Chest Height': '1.15m (Kiosk Level)', 'Shoulder Width': '420 mm' } }
                    ]
                }
            ]
        },

        // Pillar 5: Roadmap, Budget & Governance
        {
            id: 'p5-governance',
            title: 'Roadmap, Budget & Governance',
            subtitle: 'Milestones, LKR finance & team',
            category: 'PILLAR 05',
            color: '#ec4899',
            icon: 'fa-chart-gantt',
            description: 'Comprehensive 9-month execution schedule, component cost accounting, operational state machines, and academic team governance.',
            specs: {
                'Timeline': '9-Month 4-Phase Delivery',
                'Total Budget': 'LKR 680,000 Estimated',
                'Organization': 'CYNOCOR &bull; Group G 40'
            },
            children: [
                {
                    id: 'sub-5-1',
                    title: '9-Month 4-Phase Roadmap',
                    subtitle: 'Research, assembly, software & test',
                    category: 'SCHEDULE',
                    color: '#f43f5e',
                    icon: 'fa-calendar-days',
                    description: 'Structured engineering milestones driving CYNO BOT from CAD conceptualization to live reception hall demonstration.',
                    specs: { 'Duration': '9 Calendar Months', 'Phases': '4 Distinct Phases', 'Reviews': 'Monthly Audits' },
                    children: [
                        { id: 'leaf-60', title: 'Phase 1: Research, CAD & Feasibility', subtitle: 'Months 1–2: Requirements & 3D kinematic model', category: 'PHASE 1', color: '#4ade80', icon: 'fa-compass-drafting', description: 'Literature review, kinematic joint calculations, Fusion 360 models, and parts sourcing.', specs: { 'Timeline': 'Month 1–2', 'Deliverable': 'Complete CAD Model & Feasibility Report', 'Status': '100% Completed' } },
                        { id: 'leaf-61', title: 'Phase 2: Fabrication & Chassis Assembly', subtitle: 'Months 3–4: 3D printing armor & wiring loom', category: 'PHASE 2', color: '#4ade80', icon: 'fa-screwdriver-wrench', description: 'Extrusion cutting, PETG 3D printing, steel bracket CNC milling, and power wiring.', specs: { 'Timeline': 'Month 3–4', 'Deliverable': 'Physical Chassis & Battery Testbed', 'Status': '100% Completed' } },
                        { id: 'leaf-62', title: 'Phase 3: Software & AI Integration', subtitle: 'Months 5–6: Whisper STT, LLM & ESP32 firmware', category: 'PHASE 3', color: '#4ade80', icon: 'fa-laptop-code', description: 'CoreML model quantization, FreeRTOS serial protocol, and chest kiosk UI development.', specs: { 'Timeline': 'Month 5–6', 'Deliverable': 'Functional Autonomous Software Stack', 'Status': '100% Completed' } },
                        { id: 'leaf-63', title: 'Phase 4: Field Testing & Campus Unveil', subtitle: 'Months 7–9: Reception trials & public showcase', category: 'PHASE 4', color: '#4ade80', icon: 'fa-trophy', description: 'Live deployment in faculty foyer, latency optimization, safety audit, and final presentation.', specs: { 'Timeline': 'Month 7–9', 'Deliverable': 'Live Working Showcase & Thesis Defense', 'Status': 'Active Execution' } }
                    ]
                },
                {
                    id: 'sub-5-2',
                    title: 'Component Budget & Allocation',
                    subtitle: 'Transparent LKR cost distribution',
                    category: 'BUDGET',
                    color: '#f43f5e',
                    icon: 'fa-coins',
                    description: 'Itemized expenditure accounting across computing host, sensors, power modules, mechanical structure, and contingency.',
                    specs: { 'Total Estimate': 'LKR 680,000', 'Allocation': '5 Key Spending Tiers', 'Contingency': '6.6% Buffer' },
                    children: [
                        { id: 'leaf-64', title: 'Computing & M1 Brain (LKR 280,000)', subtitle: 'Apple Mac mini host, RAM & NVMe SSD', category: 'TIER 1', color: '#4ade80', icon: 'fa-laptop', description: 'Primary financial allocation dedicated to the Apple M1 neural computing engine.', specs: { 'Cost': 'LKR 280,000', 'Percentage': '41.2% Total Budget', 'Components': 'M1 Host, RAM, NVMe' } },
                        { id: 'leaf-65', title: 'Sensors, Displays & Kiosk (LKR 145,000)', subtitle: '10" touchscreen, camera, mics & radar', category: 'TIER 2', color: '#4ade80', icon: 'fa-tv', description: 'Acquisition of IPS capacitive touch kiosk, dual OLED eyes, camera, and sensors.', specs: { 'Cost': 'LKR 145,000', 'Percentage': '21.3% Total Budget', 'Components': 'Touchscreen, Vision, Audio' } },
                        { id: 'leaf-66', title: 'Power, Battery & BMS (LKR 95,000)', subtitle: '24V 15Ah lithium pack, BMS & chargers', category: 'TIER 3', color: '#4ade80', icon: 'fa-battery-three-quarters', description: 'High-capacity lithium cells, safety protection BMS, and high-efficiency buck regulators.', specs: { 'Cost': 'LKR 95,000', 'Percentage': '14.0% Total Budget', 'Components': 'Li-ion Cells, Regulators, BMS' } },
                        { id: 'leaf-67', title: 'Mechanical Frame & Servos (LKR 115,000)', subtitle: 'Extrusions, PETG filament & metal servos', category: 'TIER 4', color: '#4ade80', icon: 'fa-toolbox', description: 'Aluminum extrusions, 3D printing filament, hardware bearings, and joint servos.', specs: { 'Cost': 'LKR 115,000', 'Percentage': '16.9% Total Budget', 'Components': 'Aluminum, PETG, Servos, Base' } },
                        { id: 'leaf-68', title: 'Safety Testing & Spares (LKR 45,000)', subtitle: 'Emergency stops, fuses & testing tools', category: 'TIER 5', color: '#4ade80', icon: 'fa-shield-halved', description: 'Contingency fund reserved for spare servos, replacement sensors, and safety certifications.', specs: { 'Cost': 'LKR 45,000', 'Percentage': '6.6% Total Budget', 'Components': 'Fuses, E-Stop, Spares' } }
                    ]
                },
                {
                    id: 'sub-5-3',
                    title: 'Autonomous Behavioral Operating Modes',
                    subtitle: '4 state-machine operational states',
                    category: 'STATE MACHINE',
                    color: '#f43f5e',
                    icon: 'fa-toggle-on',
                    description: 'Deterministic finite-state machine governing robot postures, greetings, interactive kiosk dialogs, and low-power standby.',
                    specs: { 'Active Modes': '4 Distinct Operational States', 'Transition': 'Proximity & Touch Triggers', 'Architecture': 'Finite State Machine' },
                    children: [
                        { id: 'leaf-69', title: 'Entrance Hospitality Reception Mode', subtitle: 'Welcomes arrivals with speech & waving', category: 'MODE 1', color: '#4ade80', icon: 'fa-door-open', description: 'Default daytime state triggered when visitors step within 1.5m radar perimeter.', specs: { 'Trigger': 'Radar <1.5m', 'Actions': 'Wave Arm, Greet Voice, Eye Smile', 'Timeout': '60s Return to Idle' } },
                        { id: 'leaf-70', title: 'Interactive Kiosk Wayfinding Mode', subtitle: 'Engages touchscreen directory guidance', category: 'MODE 2', color: '#4ade80', icon: 'fa-hand-pointer', description: 'Activated upon kiosk touch; provides department maps and live conversational Q&A.', specs: { 'Trigger': 'Screen Touch / Voice Query', 'Actions': 'Display Map, Generate Reply', 'Privacy': 'Local Session Only' } },
                        { id: 'leaf-71', title: 'Nighttime Safety Sentry Mode', subtitle: 'Monitors air sensors, flame & thermal alerts', category: 'MODE 3', color: '#4ade80', icon: 'fa-moon', description: 'Low-power state active outside university hours scanning for fire hazards and gas leaks.', specs: { 'Power Draw': '9W Low Idle', 'Active Sensors': 'MQ-135, Flame, Thermistors', 'Alarm': 'Visual Halo Strobe' } },
                        { id: 'leaf-72', title: 'Low-Power Standby Sleep Mode', subtitle: '7W ultra-low idle with instant radar wake', category: 'MODE 4', color: '#4ade80', icon: 'fa-bed', description: 'Turns off OLED eyes and dims kiosk screen after 5 minutes of hallway inactivity.', specs: { 'Power': '7W Active Idle', 'Wake Source': 'Ultrasonic or Wake Word', 'Wake Time': '<80 ms' } }
                    ]
                },
                {
                    id: 'sub-5-4',
                    title: 'CYNOCOR Academic Team Governance',
                    subtitle: 'Group G 40, ethics & quality control',
                    category: 'TEAM & ETHICS',
                    color: '#f43f5e',
                    icon: 'fa-users',
                    description: 'Undergraduate engineering student development team operating under faculty supervision and IEEE robotics standards.',
                    specs: { 'Team Group': 'Group G 40 (ATP 2026)', 'Institution': 'Department of Computer Systems', 'Ethical Standards': 'IEEE P7000' },
                    children: [
                        { id: 'leaf-73', title: 'Multidisciplinary Team Structure', subtitle: 'Group G 40 engineering students', category: 'TEAM', color: '#4ade80', icon: 'fa-id-badge', description: 'Coordinated division of labor across AI/ML, embedded systems, CAD, and UI design.', specs: { 'Lead Roles': 'AI Engineering, Hardware, CAD, Software', 'Collaboration': 'Git Workflow', 'Members': 'Undergraduate Researchers' } },
                        { id: 'leaf-74', title: 'Bi-Weekly Faculty Review Audits', subtitle: 'Rigorous progress and milestone checks', category: 'AUDITS', color: '#4ade80', icon: 'fa-clipboard-check', description: 'Faculty advisors evaluate hardware safety, kinematics reliability, and code performance.', specs: { 'Frequency': 'Fortnightly', 'Evaluation': 'Milestone Gate Reviews', 'Approval': 'Academic Board' } },
                        { id: 'leaf-75', title: 'IEEE Human-Robot Safety Compliance', subtitle: 'Safe collaborative robotics guidelines', category: 'SAFETY STD', color: '#4ade80', icon: 'fa-certificate', description: 'Adherence to collaborative robotic standards: low joint inertia, rounded edges, and e-stop.', specs: { 'Standard': 'IEEE P7000 & ISO 13482', 'Risk Assessment': 'Zero Pinch Point Class', 'Audit': 'Peer Reviewed' } },
                        { id: 'leaf-76', title: 'Open-Source Academic Documentation', subtitle: 'Modular CAD, wiring diagrams & software', category: 'DOCUMENTATION', color: '#4ade80', icon: 'fa-book-open', description: 'Comprehensive project archive ensuring full reproducibility for future student cohorts.', specs: { 'Repository': 'GitHub Modular Codebase', 'License': 'Academic Open Access', 'Archive': 'Full Thesis Archive' } }
                    ]
                }
            ]
        }
    ]
};

        let mindmapPan = { x: 0, y: 0 };
        let mindmapZoom = window.innerWidth < 768 ? 0.32 : 0.52;
        let mindmapIsDragging = false;
        let mindmapStartPointer = { x: 0, y: 0 };
        let mindmapInitialPan = { x: 0, y: 0 };
        let mindmapCollapsedNodes = new Set();
        let mindmapSelectedNodeId = null;
        let mindmapNodesFlat = [];
        let mindmapIsAllCollapsed = false;

        function assignMindmapCoordinates() {
            const ROW_HEIGHT = 38;

            // 1. Root at exact center (0, 0)
            CYNO_MINDMAP_DATA.w = 270;
            CYNO_MINDMAP_DATA.h = 58;
            CYNO_MINDMAP_DATA.x = 0;
            CYNO_MINDMAP_DATA.y = 0;

            // Split pillars: Left = Computing + Sensing; Right = HRI + Chassis + Roadmap
            const leftPillars = [CYNO_MINDMAP_DATA.children[0], CYNO_MINDMAP_DATA.children[1]];
            const rightPillars = [CYNO_MINDMAP_DATA.children[2], CYNO_MINDMAP_DATA.children[3], CYNO_MINDMAP_DATA.children[4]];

            // --- LEFT SIDE LAYOUT ---
            let currentYLeft = 0;
            function layoutLeftSubsystem(sub) {
                sub.w = 230; sub.h = 32;
                sub.x = -620;
                sub.side = 'left';
                const isSubCollapsed = mindmapCollapsedNodes.has(sub.id);
                const children = sub.children || [];
                if (isSubCollapsed || children.length === 0) {
                    sub.y = currentYLeft;
                    currentYLeft += ROW_HEIGHT;
                } else {
                    const childYs = [];
                    children.forEach(leaf => {
                        leaf.w = 255; leaf.h = 28;
                        leaf.x = -920;
                        leaf.y = currentYLeft;
                        leaf.side = 'left';
                        childYs.push(currentYLeft);
                        currentYLeft += ROW_HEIGHT;
                    });
                    sub.y = (childYs[0] + childYs[childYs.length - 1]) / 2;
                }
            }

            function layoutLeftPillar(pillar) {
                pillar.w = 250; pillar.h = 42;
                pillar.x = -320;
                pillar.side = 'left';
                const isPillarCollapsed = mindmapCollapsedNodes.has(pillar.id);
                const children = pillar.children || [];
                if (isPillarCollapsed || children.length === 0) {
                    pillar.y = currentYLeft;
                    currentYLeft += ROW_HEIGHT * 1.5;
                } else {
                    children.forEach(sub => layoutLeftSubsystem(sub));
                    pillar.y = (children[0].y + children[children.length - 1].y) / 2;
                    currentYLeft += 22;
                }
            }

            leftPillars.forEach(p => layoutLeftPillar(p));
            const offsetLeft = currentYLeft / 2;
            function applyOffsetLeft(node) {
                node.y -= offsetLeft;
                if (node.children) node.children.forEach(applyOffsetLeft);
            }
            leftPillars.forEach(p => applyOffsetLeft(p));

            // --- RIGHT SIDE LAYOUT ---
            let currentYRight = 0;
            function layoutRightSubsystem(sub) {
                sub.w = 230; sub.h = 32;
                sub.x = 620;
                sub.side = 'right';
                const isSubCollapsed = mindmapCollapsedNodes.has(sub.id);
                const children = sub.children || [];
                if (isSubCollapsed || children.length === 0) {
                    sub.y = currentYRight;
                    currentYRight += ROW_HEIGHT;
                } else {
                    const childYs = [];
                    children.forEach(leaf => {
                        leaf.w = 255; leaf.h = 28;
                        leaf.x = 920;
                        leaf.y = currentYRight;
                        leaf.side = 'right';
                        childYs.push(currentYRight);
                        currentYRight += ROW_HEIGHT;
                    });
                    sub.y = (childYs[0] + childYs[childYs.length - 1]) / 2;
                }
            }

            function layoutRightPillar(pillar) {
                pillar.w = 250; pillar.h = 42;
                pillar.x = 320;
                pillar.side = 'right';
                const isPillarCollapsed = mindmapCollapsedNodes.has(pillar.id);
                const children = pillar.children || [];
                if (isPillarCollapsed || children.length === 0) {
                    pillar.y = currentYRight;
                    currentYRight += ROW_HEIGHT * 1.5;
                } else {
                    children.forEach(sub => layoutRightSubsystem(sub));
                    pillar.y = (children[0].y + children[children.length - 1].y) / 2;
                    currentYRight += 22;
                }
            }

            rightPillars.forEach(p => layoutRightPillar(p));
            const offsetRight = currentYRight / 2;
            function applyOffsetRight(node) {
                node.y -= offsetRight;
                if (node.children) node.children.forEach(applyOffsetRight);
            }
            rightPillars.forEach(p => applyOffsetRight(p));
        }

        function flattenMindmapNodes(node, list = [], parent = null) {
            node.parent = parent;
            list.push(node);
            if (node.children) {
                node.children.forEach(c => flattenMindmapNodes(c, list, node));
            }
            return list;
        }

        function updateMindmapTransform() {
            const surface = document.getElementById('mindmap-canvas-surface');
            if (!surface) return;
            surface.style.transform = `translate(${mindmapPan.x}px, ${mindmapPan.y}px) scale(${mindmapZoom})`;
        }

        function renderMindmap() {
            const nodesContainer = document.getElementById('mindmap-nodes-container');
            const linesGroup = document.getElementById('mindmap-lines-group');
            if (!nodesContainer || !linesGroup) return;

            assignMindmapCoordinates();

            let nodesHtml = '';
            let linesSvg = '';

            // Bezier line builder supporting both Left and Right branches
            function createBilateralBezier(parent, child, color, opacity) {
                const op = opacity || 0.55;
                const isLeft = child.side === 'left';
                const startX = isLeft ? (parent.x - parent.w / 2) : (parent.x + parent.w / 2);
                const startY = parent.y;
                const endX = isLeft ? (child.x + child.w / 2) : (child.x - child.w / 2);
                const endY = child.y;
                const cpX = startX + (endX - startX) * 0.5;
                const d = `M ${startX} ${startY} C ${cpX} ${startY}, ${cpX} ${endY}, ${endX} ${endY}`;
                return `
                    <path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-dasharray="4 3" stroke-opacity="${op}" class="mindmap-connector-line"/>
                    <path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-dasharray="4 3" class="mindmap-connector-pulse" opacity="0.75"/>
                `;
            }

            // 1. Center Root Node
            const root = CYNO_MINDMAP_DATA;
            const rootLeft = root.x - root.w / 2;
            const rootTop = root.y - root.h / 2;

            nodesHtml += `
                <div class="mindmap-node pointer-events-auto absolute flex items-center justify-center gap-3 px-4 py-2.5 rounded-full bg-slate-900 border-2 border-slate-700 text-white shadow-xl hover:border-sky-400"
                     style="left: ${rootLeft}px; top: ${rootTop}px; width: ${root.w}px; height: ${root.h}px;"
                     data-node-id="${root.id}"
                     onclick="selectMindmapNode('${root.id}')">
                    <div class="w-9 h-9 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 flex items-center justify-center text-sm shrink-0">
                        <i class="fa-solid ${root.icon}"></i>
                    </div>
                    <div class="min-w-0 pr-1 text-left">
                        <div class="text-[9px] font-mono text-sky-400 font-bold uppercase tracking-wider">${root.category}</div>
                        <h4 class="text-xs font-bold text-white leading-tight truncate">${root.title}</h4>
                        <p class="text-[9px] text-slate-300 truncate">${root.subtitle}</p>
                    </div>
                </div>
            `;

            // 2. Pillars, Subsystems, and Leaves
            (root.children || []).forEach(pillar => {
                const isPillarCollapsed = mindmapCollapsedNodes.has(pillar.id);
                const hasPillarChildren = pillar.children && pillar.children.length > 0;
                const isLeft = pillar.side === 'left';

                const pLeft = pillar.x - pillar.w / 2;
                const pTop = pillar.y - pillar.h / 2;

                linesSvg += createBilateralBezier(root, pillar, pillar.color || '#0284c7', 0.6);

                // Toggle button HTML
                const pillarToggleBtn = hasPillarChildren ? `
                    <button onclick="toggleNodeCollapse('${pillar.id}', event)" class="shrink-0 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center text-[8px] font-mono transition" title="${isPillarCollapsed ? 'Expand branch' : 'Collapse branch'}">
                        ${isPillarCollapsed ? '<i class="fa-solid fa-plus"></i>' : '<i class="fa-solid fa-minus"></i>'}
                    </button>
                ` : '';

                nodesHtml += `
                    <div class="mindmap-node pointer-events-auto absolute flex items-center justify-between px-3 py-1.5 rounded-full bg-white border border-slate-300 text-slate-900 shadow-md hover:border-sky-500"
                         style="left: ${pLeft}px; top: ${pTop}px; width: ${pillar.w}px; height: ${pillar.h}px; ${isLeft ? `border-right: 4px solid ${pillar.color};` : `border-left: 4px solid ${pillar.color};`}"
                         data-node-id="${pillar.id}"
                         onclick="selectMindmapNode('${pillar.id}')">
                        ${isLeft ? pillarToggleBtn : ''}
                        <div class="flex items-center gap-2 min-w-0 px-1 ${isLeft ? 'text-right justify-end flex-1' : 'text-left flex-1'}">
                            ${!isLeft ? `
                                <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0" style="background: ${pillar.color}15; color: ${pillar.color};">
                                    <i class="fa-solid ${pillar.icon}"></i>
                                </div>
                            ` : ''}
                            <div class="min-w-0 flex-1">
                                <h4 class="text-[11px] font-bold text-slate-900 leading-tight truncate">${pillar.title}</h4>
                                <p class="text-[8.5px] text-slate-500 truncate">${pillar.subtitle}</p>
                            </div>
                            ${isLeft ? `
                                <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0" style="background: ${pillar.color}15; color: ${pillar.color};">
                                    <i class="fa-solid ${pillar.icon}"></i>
                                </div>
                            ` : ''}
                        </div>
                        ${!isLeft ? pillarToggleBtn : ''}
                    </div>
                `;

                // 3. Render Subsystems if pillar expanded
                if (!isPillarCollapsed && hasPillarChildren) {
                    pillar.children.forEach(sub => {
                        const isSubCollapsed = mindmapCollapsedNodes.has(sub.id);
                        const hasSubChildren = sub.children && sub.children.length > 0;

                        const sLeft = sub.x - sub.w / 2;
                        const sTop = sub.y - sub.h / 2;

                        linesSvg += createBilateralBezier(pillar, sub, sub.color || '#0284c7', 0.5);

                        const subToggleBtn = hasSubChildren ? `
                            <button onclick="toggleNodeCollapse('${sub.id}', event)" class="shrink-0 w-4 h-4 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center text-[7.5px] font-mono transition" title="${isSubCollapsed ? 'Expand branch' : 'Collapse branch'}">
                                ${isSubCollapsed ? '<i class="fa-solid fa-plus"></i>' : '<i class="fa-solid fa-minus"></i>'}
                            </button>
                        ` : '';

                        nodesHtml += `
                            <div class="mindmap-node pointer-events-auto absolute flex items-center justify-between px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-800 shadow-2xs hover:border-sky-400"
                                 style="left: ${sLeft}px; top: ${sTop}px; width: ${sub.w}px; height: ${sub.h}px; ${isLeft ? `border-right: 3px solid ${sub.color};` : `border-left: 3px solid ${sub.color};`}"
                                 data-node-id="${sub.id}"
                                 onclick="selectMindmapNode('${sub.id}')">
                                 ${isLeft ? subToggleBtn : ''}
                                 <div class="flex items-center gap-1.5 min-w-0 px-1 ${isLeft ? 'text-right justify-end flex-1' : 'text-left flex-1'}">
                                     ${!isLeft ? `
                                         <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0" style="background: ${sub.color}15; color: ${sub.color};">
                                             <i class="fa-solid ${sub.icon}"></i>
                                         </div>
                                     ` : ''}
                                     <div class="min-w-0 flex-1">
                                         <h5 class="text-[10px] font-semibold text-slate-800 leading-tight truncate">${sub.title}</h5>
                                     </div>
                                     ${isLeft ? `
                                         <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0" style="background: ${sub.color}15; color: ${sub.color};">
                                             <i class="fa-solid ${sub.icon}"></i>
                                         </div>
                                     ` : ''}
                                 </div>
                                 ${!isLeft ? subToggleBtn : ''}
                             </div>
                         `;

                        // 4. Render Leaf nodes if subsystem expanded
                        if (!isSubCollapsed && hasSubChildren) {
                            sub.children.forEach(leaf => {
                                const lLeft = leaf.x - leaf.w / 2;
                                const lTop = leaf.y - leaf.h / 2;

                                linesSvg += createBilateralBezier(sub, leaf, leaf.color || '#059669', 0.45);

                                nodesHtml += `
                                    <div class="mindmap-node pointer-events-auto absolute flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs hover:border-emerald-500"
                                         style="left: ${lLeft}px; top: ${lTop}px; width: ${leaf.w}px; height: ${leaf.h}px; ${isLeft ? `border-right: 3px solid ${leaf.color};` : `border-left: 3px solid ${leaf.color};`}"
                                         data-node-id="${leaf.id}"
                                         onclick="selectMindmapNode('${leaf.id}')">
                                        ${!isLeft ? `
                                            <div class="w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0" style="background: ${leaf.color}15; color: ${leaf.color};">
                                                <i class="fa-solid ${leaf.icon}"></i>
                                            </div>
                                        ` : ''}
                                        <div class="min-w-0 flex-1 ${isLeft ? 'text-right' : 'text-left'}">
                                            <span class="text-[9.5px] font-medium text-slate-700 truncate block leading-none">${leaf.title}</span>
                                        </div>
                                        ${isLeft ? `
                                            <div class="w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0" style="background: ${leaf.color}15; color: ${leaf.color};">
                                                <i class="fa-solid ${leaf.icon}"></i>
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            });
                        }
                    });
                }
            });


            nodesContainer.innerHTML = nodesHtml;
            linesGroup.innerHTML = linesSvg;

            if (mindmapSelectedNodeId) {
                const el = document.querySelector(`.mindmap-node[data-node-id="${mindmapSelectedNodeId}"]`);
                if (el) el.classList.add('selected');
            }
        }

        let mindmapInitialized = false;

        function initMindmap() {
            const viewport = document.getElementById('mindmap-viewport');
            if (!viewport) return;

            mindmapNodesFlat = flattenMindmapNodes(CYNO_MINDMAP_DATA);
            renderMindmap();
            updateMindmapTransform();

            if (mindmapInitialized) return;
            mindmapInitialized = true;

            // Setup Mouse / Pointer Drag to Pan
            viewport.addEventListener('mousedown', (e) => {
                if (e.target.closest('button') || e.target.closest('#mindmap-inspector') || e.target.closest('input')) return;
                mindmapIsDragging = true;
                mindmapStartPointer = { x: e.clientX, y: e.clientY };
                mindmapInitialPan = { ...mindmapPan };
            });

            window.addEventListener('mousemove', (e) => {
                if (!mindmapIsDragging) return;
                const dx = e.clientX - mindmapStartPointer.x;
                const dy = e.clientY - mindmapStartPointer.y;
                mindmapPan.x = mindmapInitialPan.x + dx;
                mindmapPan.y = mindmapInitialPan.y + dy;
                updateMindmapTransform();
            });

            window.addEventListener('mouseup', () => {
                mindmapIsDragging = false;
            });

            // Touch Drag to Pan
            viewport.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    if (e.target.closest('button') || e.target.closest('#mindmap-inspector') || e.target.closest('input')) return;
                    mindmapIsDragging = true;
                    mindmapStartPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    mindmapInitialPan = { ...mindmapPan };
                }
            }, { passive: true });

            viewport.addEventListener('touchmove', (e) => {
                if (mindmapIsDragging && e.touches.length === 1) {
                    const dx = e.touches[0].clientX - mindmapStartPointer.x;
                    const dy = e.touches[0].clientY - mindmapStartPointer.y;
                    mindmapPan.x = mindmapInitialPan.x + dx;
                    mindmapPan.y = mindmapInitialPan.y + dy;
                    updateMindmapTransform();
                }
            }, { passive: true });

            viewport.addEventListener('touchend', () => {
                mindmapIsDragging = false;
            });

            // Mouse Wheel Zoom
            viewport.addEventListener('wheel', (e) => {
                e.preventDefault();
                const delta = e.deltaY < 0 ? 0.05 : -0.05;
                mindmapZoom = Math.min(2.2, Math.max(0.18, mindmapZoom + delta));
                updateMindmapTransform();
            }, { passive: false });

            // Keyboard ESC to close inspector or exit fullscreen
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeMindmapInspector();
                    const wb = document.getElementById('mindmap-workbench');
                    if (wb && wb.classList.contains('is-fullscreen')) {
                        toggleMindmapFullscreen();
                    }
                }
            });
        }

        function zoomMindmap(delta) {
            mindmapZoom = Math.min(2.2, Math.max(0.18, mindmapZoom + delta));
            updateMindmapTransform();
        }

        function resetMindmapView() {
            mindmapPan = { x: 0, y: 0 };
            const w = window.innerWidth;
            if (w < 640) {
                mindmapZoom = 0.30;
            } else if (w < 1024) {
                mindmapZoom = 0.40;
            } else {
                mindmapZoom = 0.52;
            }
            updateMindmapTransform();
        }

        function toggleAllMindmapBranches() {
            mindmapIsAllCollapsed = !mindmapIsAllCollapsed;
            const btnText = document.getElementById('mindmap-toggle-branches-btn');
            if (btnText) {
                btnText.textContent = mindmapIsAllCollapsed ? 'Expand All' : 'Collapse All';
            }

            if (mindmapIsAllCollapsed) {
                CYNO_MINDMAP_DATA.children.forEach(pillar => {
                    mindmapCollapsedNodes.add(pillar.id);
                    (pillar.children || []).forEach(sub => mindmapCollapsedNodes.add(sub.id));
                });
            } else {
                mindmapCollapsedNodes.clear();
            }
            renderMindmap();
        }

        function toggleNodeCollapse(nodeId, e) {
            if (e) e.stopPropagation();
            if (mindmapCollapsedNodes.has(nodeId)) {
                mindmapCollapsedNodes.delete(nodeId);
            } else {
                mindmapCollapsedNodes.add(nodeId);
            }
            renderMindmap();
        }

        function selectMindmapNode(nodeId) {
            const node = mindmapNodesFlat.find(n => n.id === nodeId);
            if (!node) return;

            mindmapSelectedNodeId = nodeId;

            document.querySelectorAll('.mindmap-node').forEach(el => {
                el.classList.toggle('selected', el.getAttribute('data-node-id') === nodeId);
            });

            const inspector = document.getElementById('mindmap-inspector');
            if (!inspector) return;

            const titleEl = document.getElementById('inspector-title');
            const subEl = document.getElementById('inspector-subtitle');
            const descEl = document.getElementById('inspector-description');
            const iconEl = document.getElementById('inspector-icon');
            const badgeEl = document.getElementById('inspector-badge');
            const iconBox = document.getElementById('inspector-icon-box');
            const specsContainer = document.getElementById('inspector-specs');

            if (titleEl) titleEl.textContent = node.title;
            if (subEl) subEl.textContent = node.subtitle || '';
            if (descEl) descEl.textContent = node.description || '';
            if (badgeEl) {
                badgeEl.textContent = node.category || 'SUBSYSTEM';
                badgeEl.style.borderColor = (node.color || '#00d2ff') + '55';
                badgeEl.style.color = node.color || '#00d2ff';
            }
            if (iconBox && node.color) {
                iconBox.style.borderColor = node.color + '55';
                iconBox.style.color = node.color;
            }
            if (iconEl && node.icon) {
                iconEl.className = `fa-solid ${node.icon}`;
            }

            if (specsContainer && node.specs) {
                specsContainer.innerHTML = Object.entries(node.specs).map(([key, val]) => `
                    <div class="flex items-center justify-between p-1.5 rounded bg-white/[0.04] border border-white/[0.08]">
                        <span class="text-slate-400 font-medium">${key}</span>
                        <span class="text-white text-right font-semibold text-cyan-300">${val}</span>
                    </div>
                `).join('');
            } else if (specsContainer) {
                specsContainer.innerHTML = '<p class="text-slate-500 text-xs italic">No additional specs provided.</p>';
            }

            inspector.classList.remove('translate-x-[110%]', 'opacity-0');
        }

        function closeMindmapInspector() {
            const inspector = document.getElementById('mindmap-inspector');
            if (inspector) inspector.classList.add('translate-x-[110%]', 'opacity-0');
            document.querySelectorAll('.mindmap-node.selected').forEach(el => el.classList.remove('selected'));
            mindmapSelectedNodeId = null;
        }

        function onMindmapSearch(query) {
            const q = (query || '').trim().toLowerCase();
            const nodes = document.querySelectorAll('.mindmap-node');

            if (!q) {
                nodes.forEach(n => {
                    n.classList.remove('matched', 'dimmed');
                });
                return;
            }

            let firstMatch = null;
            let needRerender = false;

            mindmapNodesFlat.forEach(node => {
                const specsText = node.specs ? Object.entries(node.specs).map(([k, v]) => `${k} ${v}`).join(' ') : '';
                const haystack = `${node.title} ${node.subtitle || ''} ${node.description || ''} ${specsText}`.toLowerCase();
                const matches = haystack.includes(q);

                if (matches) {
                    if (!firstMatch) firstMatch = node;
                    let cur = node.parent;
                    while (cur) {
                        if (mindmapCollapsedNodes.has(cur.id)) {
                            mindmapCollapsedNodes.delete(cur.id);
                            needRerender = true;
                        }
                        cur = cur.parent;
                    }
                }
            });

            if (needRerender) {
                renderMindmap();
            }

            mindmapNodesFlat.forEach(node => {
                const el = document.querySelector(`.mindmap-node[data-node-id="${node.id}"]`);
                if (!el) return;
                const specsText = node.specs ? Object.entries(node.specs).map(([k, v]) => `${k} ${v}`).join(' ') : '';
                const haystack = `${node.title} ${node.subtitle || ''} ${node.description || ''} ${specsText}`.toLowerCase();
                if (haystack.includes(q)) {
                    el.classList.add('matched');
                    el.classList.remove('dimmed');
                } else {
                    el.classList.remove('matched');
                    el.classList.add('dimmed');
                }
            });

            if (firstMatch) {
                mindmapPan.x = -firstMatch.x * mindmapZoom;
                mindmapPan.y = -firstMatch.y * mindmapZoom;
                updateMindmapTransform();
            }
        }

        function toggleMindmapFullscreen() {
            const wb = document.getElementById('mindmap-workbench');
            const icon = document.getElementById('mindmap-fullscreen-icon');
            if (!wb) return;

            wb.classList.toggle('is-fullscreen');
            const isFull = wb.classList.contains('is-fullscreen');
            if (icon) {
                icon.className = isFull ? 'fa-solid fa-compress text-xs' : 'fa-solid fa-expand text-xs';
            }
            if (isFull) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
            resetMindmapView();
        }

        window.initMindmap = initMindmap;
        window.zoomMindmap = zoomMindmap;
        window.resetMindmapView = resetMindmapView;
        window.toggleAllMindmapBranches = toggleAllMindmapBranches;
        window.toggleNodeCollapse = toggleNodeCollapse;
        window.selectMindmapNode = selectMindmapNode;
        window.closeMindmapInspector = closeMindmapInspector;
        window.onMindmapSearch = onMindmapSearch;
        window.toggleMindmapFullscreen = toggleMindmapFullscreen;

        // Auto-run if elements are already loaded in DOM
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            startApp();
            initMindmap();
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                startApp();
                initMindmap();
            });
        }



