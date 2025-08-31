"use client"

import * as React from "react"
import { api } from "@/lib/api"
import { Organization, Exam, Question } from "@/types/api"
import { Skeleton } from "@/components/ui/skeleton"

interface ItemDetailProps {
  item: {
    type: string
    id: string
  } | null
}

// 组织详情组件
const OrganizationDetail = ({ data }: { data: Organization }) => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold">{data.name}</h1>
    <div className="text-sm text-muted-foreground">{data.organizationCode}</div>
    <p>{data.description}</p>
    <div className="grid grid-cols-2 gap-4 pt-4">
      <div>
        <h3 className="font-semibold">地区</h3>
        <p>{data.region}</p>
      </div>
      <div>
        <h3 className="font-semibold">状态</h3>
        <p className="capitalize">{data.status}</p>
      </div>
      <div>
        <h3 className="font-semibold">成立日期</h3>
        <p>{data.establishmentDate}</p>
      </div>
      {data.contactInfo?.email && (
        <div>
          <h3 className="font-semibold">联系邮箱</h3>
          <p>{data.contactInfo.email}</p>
        </div>
      )}
    </div>
  </div>
)

// 考试详情组件
const ExamDetail = ({ data }: { data: Exam }) => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold">{data.name}</h1>
    <div className="text-sm text-muted-foreground">{data.examCode}</div>
    <p>{data.description}</p>
    <div className="grid grid-cols-2 gap-4 pt-4">
      <div>
        <h3 className="font-semibold">所属组织</h3>
        <p>{data.organizationName}</p>
      </div>
      <div>
        <h3 className="font-semibold">年级</h3>
        <p>{data.gradeLevel}</p>
      </div>
      <div>
        <h3 className="font-semibold">类型</h3>
        <p>{data.examType}</p>
      </div>
      <div>
        <h3 className="font-semibold">状态</h3>
        <p className="capitalize">{data.status}</p>
      </div>
      <div>
        <h3 className="font-semibold">开始日期</h3>
        <p>{data.startDate}</p>
      </div>
      <div>
        <h3 className="font-semibold">结束日期</h3>
        <p>{data.endDate}</p>
      </div>
      <div>
        <h3 className="font-semibold">题目总数</h3>
        <p>{data.totalQuestions}</p>
      </div>
    </div>
    <div className="pt-4">
      <h3 className="font-semibold mb-2">包含科目</h3>
      <ul className="list-disc list-inside space-y-1">
        {data.subjects.map(subject => (
          <li key={subject.subject}>{subject.subject} ({subject.totalScore}分)</li>
        ))}
      </ul>
    </div>
  </div>
)

// 题目详情组件
const QuestionDetail = ({ data }: { data: Question }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-start">
      <h1 className="text-xl font-bold flex-1">{data.questionText}</h1>
      <span className="text-sm text-muted-foreground ml-4">{data.questionCode}</span>
    </div>
    <div className="grid grid-cols-3 gap-4 pt-4">
      <div>
        <h3 className="font-semibold">学科</h3>
        <p>{data.subject}</p>
      </div>
      <div>
        <h3 className="font-semibold">题型</h3>
        <p>{data.questionType}</p>
      </div>
      <div>
        <h3 className="font-semibold">难度</h3>
        <p>{data.difficultyLevel}</p>
      </div>
    </div>
    {data.options.length > 0 && (
      <div className="pt-4">
        <h3 className="font-semibold mb-2">选项</h3>
        <ul className="space-y-2">
          {data.options.map(option => (
            <li key={option.label} className={`p-2 rounded ${option.isCorrect ? 'bg-green-100' : ''}`}>
              <strong>{option.label}:</strong> {option.content}
            </li>
          ))}
        </ul>
      </div>
    )}
    <div className="pt-4">
      <h3 className="font-semibold mb-2">参考答案</h3>
      <p className="p-2 bg-gray-100 rounded">{data.referenceAnswer}</p>
    </div>
    <div className="pt-4">
      <h3 className="font-semibold mb-2">知识点</h3>
      <div className="flex flex-wrap gap-2">
        {data.knowledgePoints.map(kp => (
          <span key={kp} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {kp}
          </span>
        ))}
      </div>
    </div>
  </div>
)

// 加载骨架屏
const DetailSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-1/4" />
    <Skeleton className="h-20 w-full" />
    <div className="grid grid-cols-2 gap-4 pt-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
)

export function ItemDetail({ item }: ItemDetailProps) {
  const [data, setData] = React.useState<Organization | Exam | Question | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!item) {
      setData(null)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        let response = null
        if (item.type === 'organization') {
          response = await api.organization.getDetail(item.id)
        } else if (item.type === 'exam') {
          response = await api.exam.getDetail(item.id)
        } else if (item.type === 'question') {
          response = await api.question.getDetail(item.id)
        }
        setData(response)
      } catch (error) {
        console.error(`Failed to fetch ${item.type} details:`, error)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [item])

  const renderDetail = () => {
    if (loading) {
      return <DetailSkeleton />
    }

    if (!data || !item) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p>请从左侧选择一个项目以查看详情</p>
          </div>
        </div>
      )
    }

    switch (item.type) {
      case 'organization':
        return <OrganizationDetail data={data as Organization} />
      case 'exam':
        return <ExamDetail data={data as Exam} />
      case 'question':
        return <QuestionDetail data={data as Question} />
      default:
        return null
    }
  }

  return <div className="p-8 h-full overflow-y-auto">{renderDetail()}</div>
}
