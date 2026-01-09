import { FC, useState, useEffect } from 'react';
import { Button, Card, Typography, Row, Col, Tag, Spin } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { getSubscriptionPlans, createCheckoutSession } from '@/apis/subscription';
import styles from './index.module.scss';

const { Title, Text } = Typography;

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

const Subscription: FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const { currentPlan, isSubscribed } = useSubscriptionStore();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await getSubscriptionPlans();
      if (response.data.code === 200) {
        setPlans(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      // Use demo plans if API fails
      setPlans([
        {
          id: 'basic',
          name: 'Basic',
          price: 9.99,
          currency: 'USD',
          interval: 'month',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 19.99,
          currency: 'USD',
          interval: 'month',
          features: ['All Basic features', 'Feature 4', 'Feature 5', 'Priority support'],
          popular: true,
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 49.99,
          currency: 'USD',
          interval: 'month',
          features: ['All Pro features', 'Custom integrations', 'Dedicated support', 'SLA'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setProcessingPlanId(planId);
    try {
      const response = await createCheckoutSession(planId);
      if (response.data.code === 200 && response.data.data.url) {
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    } finally {
      setProcessingPlanId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2}>Choose Your Plan</Title>
        <Text className={styles.subtitle}>
          Select the plan that best fits your needs
        </Text>
      </div>

      <Row gutter={[24, 24]} justify="center">
        {plans.map((plan) => (
          <Col key={plan.id} xs={24} sm={12} lg={8}>
            <Card
              className={`${styles.planCard} ${plan.popular ? styles.popular : ''}`}
              bordered={false}
            >
              {plan.popular && (
                <Tag color="purple" className={styles.popularTag}>
                  Most Popular
                </Tag>
              )}
              <div className={styles.planHeader}>
                <Title level={4}>{plan.name}</Title>
                <div className={styles.price}>
                  <span className={styles.currency}>{plan.currency}</span>
                  <span className={styles.amount}>{plan.price}</span>
                  <span className={styles.interval}>/{plan.interval}</span>
                </div>
              </div>
              <ul className={styles.features}>
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <CheckOutlined className={styles.checkIcon} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                type={plan.popular ? 'primary' : 'default'}
                size="large"
                block
                loading={processingPlanId === plan.id}
                disabled={isSubscribed && currentPlan?.id === plan.id}
                onClick={() => handleSubscribe(plan.id)}
              >
                {isSubscribed && currentPlan?.id === plan.id
                  ? 'Current Plan'
                  : 'Subscribe'}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Subscription;
