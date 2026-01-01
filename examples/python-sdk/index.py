"""
YYC³ Python SDK 使用示例
演示如何使用Python SDK与YYC³服务交互

@author YYC³
@version 1.0.0
@created 2025-12-31
@copyright Copyright (c) 2025 YYC³
@license MIT
"""

import asyncio
import json
import aiohttp
from typing import Dict, List, Optional, Any
from datetime import datetime


class YYC3Client:
    """YYC³ Python客户端"""

    def __init__(self, base_url: str = "http://localhost:3200"):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def login(self, email: str, password: str) -> Dict[str, Any]:
        """用户登录"""
        async with self.session.post(
            f"{self.base_url}/api/v1/auth/login",
            json={"email": email, "password": password}
        ) as response:
            data = await response.json()
            if data.get("success"):
                self.token = data["data"]["token"]
                print("✅ 登录成功，令牌已保存")
                return data
            else:
                raise Exception("登录失败")

    def _get_headers(self) -> Dict[str, str]:
        """获取请求头"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        }

    async def reason(
        self,
        context: str,
        constraints: Optional[List[str]] = None,
        objectives: Optional[List[str]] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """智能推理"""
        print("🧠 发起智能推理请求...")
        async with self.session.post(
            f"{self.base_url}/api/v1/engine/reason",
            headers=self._get_headers(),
            json={
                "context": context,
                "constraints": constraints or [],
                "objectives": objectives or [],
                "options": options or {}
            }
        ) as response:
            data = await response.json()
            print("✅ 推理完成")
            return data

    async def generate_text(
        self,
        prompt: str,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """文本生成"""
        print("🤖 发起文本生成请求...")
        async with self.session.post(
            f"{self.base_url}/api/v1/model/generate",
            headers=self._get_headers(),
            json={"prompt": prompt, "maxTokens": max_tokens}
        ) as response:
            data = await response.json()
            print("✅ 生成完成")
            return data

    async def get_metrics(self) -> Dict[str, Any]:
        """获取系统指标"""
        print("📊 获取系统指标...")
        async with self.session.get(
            f"{self.base_url}/api/v1/analytics/metrics",
            headers=self._get_headers()
        ) as response:
            data = await response.json()
            print("✅ 指标获取完成")
            return data

    async def get_learning_data(self) -> Dict[str, Any]:
        """获取学习数据"""
        print("🧠 获取学习数据...")
        async with self.session.get(
            f"{self.base_url}/api/v1/learning/data",
            headers=self._get_headers()
        ) as response:
            data = await response.json()
            print("✅ 学习数据获取完成")
            return data


async def basic_example():
    """基础使用示例"""
    print("=== YYC³ Python SDK 基础使用示例 ===\n")

    async with YYC3Client("http://localhost:3200") as client:
        await client.login("user@example.com", "your-password")

        reasoning_result = await client.reason(
            context="优化项目开发流程",
            constraints=["时间限制", "预算限制"],
            objectives=["效率提升", "质量保证"],
            options={"depth": "deep", "timeout": 30000}
        )

        print("\n📊 推理结果:")
        print(f"结论: {reasoning_result['data']['result']['conclusion']}")
        print(f"置信度: {reasoning_result['data']['result']['confidence']}")
        print(f"处理时间: {reasoning_result['data']['metadata']['processingTime']}ms")
        print(f"使用Token: {reasoning_result['data']['metadata']['tokensUsed']}")

        generation_result = await client.generate_text(
            prompt="请简述敏捷开发的核心原则",
            max_tokens=500
        )

        print("\n🤖 生成结果:")
        print(generation_result["data"]["text"])

        metrics = await client.get_metrics()
        print("\n📈 系统指标:")
        print(json.dumps(metrics, indent=2, ensure_ascii=False))

        learning_data = await client.get_learning_data()
        print("\n🧠 学习数据:")
        print(json.dumps(learning_data, indent=2, ensure_ascii=False))


async def advanced_example():
    """高级使用示例"""
    print("=== YYC³ Python SDK 高级使用示例 ===\n")

    async with YYC3Client("http://localhost:3200") as client:
        await client.login("user@example.com", "your-password")

        tasks = [
            client.reason(
                context=f"优化项目开发流程 - 场景{i}",
                constraints=["时间限制", "预算限制"],
                objectives=["效率提升", "质量保证"]
            )
            for i in range(3)
        ]

        results = await asyncio.gather(*tasks)

        print("\n📊 批量推理结果:")
        for i, result in enumerate(results, 1):
            print(f"\n场景 {i}:")
            print(f"  结论: {result['data']['result']['conclusion']}")
            print(f"  置信度: {result['data']['result']['confidence']}")

        metrics = await client.get_metrics()
        print(f"\n📈 系统指标: {json.dumps(metrics, indent=2, ensure_ascii=False)}")


async def error_handling_example():
    """错误处理示例"""
    print("=== YYC³ Python SDK 错误处理示例 ===\n")

    async with YYC3Client("http://localhost:3200") as client:
        try:
            await client.login("invalid@example.com", "wrong-password")
        except Exception as e:
            print(f"❌ 登录失败: {str(e)}")

        try:
            await client.login("user@example.com", "your-password")
        except Exception as e:
            print(f"❌ 登录失败: {str(e)}")
        else:
            print("✅ 登录成功")

            try:
                result = await client.reason(
                    context="测试推理",
                    constraints=[],
                    objectives=[]
                )
                print(f"✅ 推理成功: {result['data']['result']['conclusion']}")
            except Exception as e:
                print(f"❌ 推理失败: {str(e)}")


async def main():
    """主函数"""
    await basic_example()
    print("\n" + "="*50 + "\n")
    await advanced_example()
    print("\n" + "="*50 + "\n")
    await error_handling_example()


if __name__ == "__main__":
    asyncio.run(main())
